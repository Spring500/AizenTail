#ifndef RING_BUFFER_H
#define RING_BUFFER_H

// 环形缓冲区
template <typename T>
class RingBuffer
{
public:
   RingBuffer(int bufferSize) 
      : _size(bufferSize + 1), _arr(new T[bufferSize + 1]){}
   ~RingBuffer(){ delete[] _arr;}

   void push(T data)
   {
      _arr[_end] = data;
      _end = (_end + 1) % _size;
      if (_end == _start)
         _start = (_start + 1) % _size;
   }
   void pop(){ if (!empty()) _start = (_start + 1) % _size;}
   T& front(){ return _arr[_start];}
   T& back(){ return _arr[(_end - 1 + _size) % _size];}

   void clear(){ _start = _end = 0;}

   bool empty(){ return _start == _end;}
   bool full(){ return (_end + 1) % _size == _start;}
   int size(){ return (_end - _start + _size) % _size;}
   int max_size(){ return _size - 1;}

   T& get(int index){ return _arr[indexToReal(index)];}
   const T& operator[](int index){ return _arr[indexToReal(index)];}

   // 获取第index个元素的真实位置
   int indexToReal(int index){ return (_start + index) % _size;}
   // 获取真实位置的元素对应的index
   int realToIndex(int real){ return (real - _start + _size) % _size;}

private:
   T *_arr;
   int _start = 0;
   int _end = 0;
   int _size;
};

#endif