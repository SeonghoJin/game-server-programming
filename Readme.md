## 1.16 멀티 스레드 프로그래밍 흔한 실수들
### 1.16.1 읽기와 쓰기 모두에 잠금하지 않기

~~~c
int a;
mutex a_mutex;

void func1(){
    // lock(a_mutex); 누락
    print(a);
}

void func2(){
    lock(a_mutex);
    a = a + 10;
}
~~~

읽기 쓰기 문제를 알고 있었다면 이런 일이 없지 않았을까

###1.16.2 잠금 순서 꼬임
~~~c++
int a;
mutex a_mutex;

int b;
mutex b_mutex;
    
void func1(){
    lock(a_mutex);
    a...;
    lock(b_mutex);
    b...;
}

void func2(){
    lock(b_mutex);
    b...
    lock(a_mutex);
    a...
}
~~~

func1에서는 a - b 순서로
func2에서는 b - a 순서로 lock을 거는데 
func1에서 a를 lock걸고, 다른 스레드에서 func2를 실행하여 b를 lock을 건 순간
deadlock이 발생한다.

### 1.16.3 너무 좁은 잠금 범위
잠금 객체 범위가 높으면, 컨텍스트 스위치가 발생할 때 운영체제가 해야할 일이 많다.

- 프로세스에서의 컨텍스트 스위칭
컨텍스트 스위치는 CPU가 어떤 하나의 프로세스를 실행하고 있는 상태에서 인터럽트 요청에 의해 다음 우선 순위으 프로세스가 실행되어야 할때
기존의 프로세스의 상태 또는 레지스터 값을 저장하고 CPU가 다음 프로세스를 수행하도록 새로운 프로세스의 상태 또는 레지스터 값을 교체하는 작업을 의미한다.

- 스레드에서의 컨텍스트 스위칭
스레드는 공유하는 영역이 많기 때문에 프로세스보다 비교적 빠르다. 
캐싱 효율이 좋다.

스레드 컨텍스트 스위치가 발생할 때 운영체제가 해야할 일이 많은 이유는 아마 어떤 쓰레드가 특정 객체를 잠그고 있는지
저장해야하고 이는 스위칭할때 추가적인 작업이 필요한게 아닌가 싶다.

### 1.16.4 디바이스 타임이 섞인 잠금
디바이스 타임 : 기기에 있는 장치(네트워크 인터페이스, 디스크) 등 뭔가를 요청해서 결과가 올 때까지 기다리는 시간을 의미합니다. 
이때 스레드는 잠자는 상태입니다. 

~~~c++
lock(A);
ReadFromDisk(X);
unLock(A);
~~~

위와 같은 코드가 있을 때 
ReadFromDisk로 인해서 시리얼 병목이 발생하게 됩니다. 

시리얼 병목을 최소화 해야하는데 ReadFromDisk와 같이 시간을 잡아먹는, 하지만 기다릴 필요가 없는
디바이스 타임이 존재하여 암달의 저주를 증폭시키는 것 같다.

### 1.16.5 잠금의 전염성으로 발생한 실수
~~~c++
class A{
    int x;
    int y;
};

mutex list_mutex;
List<A> list;

void func(){
    lock(list_mutex);
    A* a = list.GetFirst();
    unLock(list_mutex);
    
    a->x++;
    // 문제가 되는 부분
}

~~~
list는 잠금으로 보호되나, 목록의 항목 하나를 가르키는 로컬 변수는 잠금이 안되어 있음,
원래는 잠가야함. 따라서 a는 list목록때문에 잠금이 강요되는 것을 알 수 있다. 이를 잠금의 전염성이라고 불린다.

### 1.16.6 잠금된 뮤텍스나 임계 영역 삭제
~~~c++
class A{
    mutex mutex;
    int a;
};

void func(){
    A* a = new A();
    lock(a->mutex);
    delete a;
}

~~~
파괴자 함수안에 잠금 상태면 오류 내는 기능을 추가하면 된다. 

### 1.16.7 일관성 규칙 깨기

~~~c++
class Node{
    Node* next;
};

Node* list = null;
int listCount = 0;

mutex listMutex;
mutex listCountMutex;

void func(){
    lock(listMutex);
    Node* newNode = new Node();
    newNode->next = list;
    list = newNode;
    unlock(listMutex);
    
    lock(listCountMutex);
    listCount++;
    unlock(listCountMutex);
}
~~~

listCount와 list에 있는 실제 자료의 갯수는 달라 질 수 있다.



