#ifndef RING_BUFFER_H
#define RING_BUFFER_H

// 环形缓冲区
template <typename TValue>
class RingBuffer
{
public:
   RingBuffer() : _size(0), _arr(nullptr){}
   RingBuffer(int bufferSize) : _size(bufferSize + 1), _arr(new TValue[bufferSize + 1]){}
   ~RingBuffer(){ delete[] _arr;}

   void push(TValue data)
   {
      _arr[_end] = data;
      _end = (_end + 1) % _size;
      if (_end == _start)
         _start = (_start + 1) % _size;
   }
   void pop(){ if (!empty()) _start = (_start + 1) % _size;}
   TValue& front(){ return _arr[_start];}
   TValue& back(){ return _arr[(_end - 1 + _size) % _size];}

   void clear(){ _start = _end = 0;}

   bool empty(){ return _start == _end;}
   bool full(){ return (_end + 1) % _size == _start;}
   int size(){ return (_end - _start + _size) % _size;}
   int max_size(){ return _size - 1;}

   void resize(int newBufferSize)
   {
      const auto newSize = newBufferSize + 1;
      if (newSize < _size)
         return;
      TValue *newArr = new TValue[newSize];
      int i = 0;
      for (int j = _start; j != _end; j = (j + 1) % _size)
         newArr[i++] = _arr[j];
      delete[] _arr;
      _arr = newArr;
      _start = 0;
      _end = i;
      _size = newSize;
   }

   TValue& get(int index){ return _arr[indexToReal(index)];}
   const TValue& operator[](int index){ return _arr[indexToReal(index)];}

   // 获取第index个元素的真实位置
   int indexToReal(int index){ return (_start + index) % _size;}
   // 获取真实位置的元素对应的index
   int realToIndex(int real){ return (real - _start + _size) % _size;}

private:
   TValue *_arr;
   int _start = 0;
   int _end = 0;
   int _size;
};

#endif