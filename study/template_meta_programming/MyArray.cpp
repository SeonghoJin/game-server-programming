#include <iostream>
#include <typeinfo>

template <typename T, unsigned int N>
class Array
{
    T data[N];

public:
    Array(T (&arr)[N])
    {
        std::cout << typeid(arr).name() << std::endl;
        for (int i = 0; i < N; i++)
        {
            data[i] = arr[i];
        }
    }

    T *get_array() { return data; }

    unsigned int size() { return N; }

    void print_all()
    {
        for (int i = 0; i < N; i++)
        {
            std::cout << data[i] << ", ";
        }
        std::cout << std::endl;
    }
};

int main()
{
    int arr[6];
    int *t_arr = new int[6];

    Array<int, 6> my_arr(arr);
    auto temp_arr = my_arr.get_array();
    my_arr.print_all();
}