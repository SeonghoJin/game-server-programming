# 사용자가 보내려는 데이터 전송 속도가 송신 속도보다 훨씬 빠를 때

원래, 버퍼 사이즈보다 송신하려는 데이터보다 훨씬 작을 때 어떻게 보내지는지 확인할려고 한 일인데, 좀 더 많은 것을 알게 된 것 같다.

일단 client와 server 측의 코드를 보면

client는 문자열 길이가 5만인 데이터를 socket에 write한다.
server는 별게 없다. 그냥 데이터를 받아 출력만한다.

집중적으로 볼 것은 client가 문자열 길이기 5만인 데이터를 보내는 것이다. 
여기서 알게된 것은 다음과 같다.

# 큐잉 지연
사실 길이가 1인 데이터를 보냈을 때, writableLength가 계속 0이였다. 이게 무슨 의미냐면 
쓰는 족족 보내진다는 것을 의미한다. 그래서 쓰는 문자열을 늘려봤더니 초반엔 0이다가 갑자기 숫자가 급격하게 증가하는데, 
아마도 이게 큐잉 지연때문인것같다. 전송속도보다 데이터가 들어오는 속도보다 더 크니까 데이터가 급격하게 쌓이는 것 같다.

# BufferSize는 Memory 크기
socket의 버퍼사이즈를 좀 알고 싶었는데 도저히 알 수가 없어서 그냥 무턱대고 많이 보냈는데, 그냥 메모리 사이즈 인것 같다. 보내면 보낼수록 Node에 대한 메모리 크기가 점점 커졌다.

<img src="https://github.com/SeonghoJin/GameServerProgramming/blob/master/chpater3/bufferSizeSendEvent/%EB%A9%94%EB%AA%A8%EB%A6%AC1.32GB.png">
1.32GB였을때 후에 10초정도? 뒤에 

<img src=https://github.com/SeonghoJin/GameServerProgramming/blob/master/chpater3/bufferSizeSendEvent/%EB%A9%94%EB%AA%A8%EB%A6%AC2.04GB.png>
가 됐다.

# Node.js 가비지 컬렉터
사실 Node.js를 사용하면서 가비지 컬렉터에 그렇게 많은 관심을 가지지 않았다. 그냥 가비지 컬렉터가 있구나, 그래서 편하게 개발할 수 있구나라고 생각하면서 여태껏 아무런 생각을 안했는데, 위에서 메모리크기가 점점 커질때 에러가 생겼다.

<img src=https://github.com/SeonghoJin/GameServerProgramming/blob/master/chpater3/bufferSizeSendEvent/%EA%B0%80%EB%B9%84%EC%A7%80%EC%BB%AC%EB%A0%89%EC%85%98.png>ㅇ

너무 많이 할당을 해서 에러가 뜬 것 같은데, 여기서 GCs를 보면 Mark-sweep이 눈에 띈다.

스터디하면서 Mark-sweep을 들어봤는데, Node.js가 Mark-sweep을 사용한다는 것을 알게 됐다.

Old Generation, New Generation으로 객체를 분리해서 다르게 GC 알고리즘을 적용한다는 것을 알고 있는데 자세하게는 모르겠다..
