#ifndef RING_BUFFER_H
#define RING_BUFFER_H

// 环形缓冲区
template <typename TValue>
class RingBuffer
{
public:
   RingBuffer() : _size(0), _arr(nullptr){}
   RingBuffer(size_t bufferSize) : _size(bufferSize + 1), _arr(new TValue[bufferSize + 1]){}
   ~RingBuffer(){ delete[] _arr;}

   void push(const TValue &data)
   {
      _arr[_end] = data;
      _end = (_end + 1) % _size;
      if (_end == _start)
         _start = (_start + 1) % _size;
   }
   void pop(){ if (!empty()) _start = (_start + 1) % _size;}
   const TValue& front(){ return _arr[_start];}
   const TValue& back(){ return _arr[(_end - 1 + _size) % _size];}

   void clear(){ _start = _end = 0;}

   bool empty(){ return _start == _end;}
   bool full(){ return (_end + 1) % _size == _start;}
   size_t size(){ return (_end - _start + _size) % _size;}
   size_t max_size(){ return _size - 1;}

   void resize(size_t newBufferSize)
   {
      const auto newSize = newBufferSize + 1;
      if (newSize < _size)
         return;
      TValue *newArr = new TValue[newSize];
      size_t i = 0;
      for (size_t j = _start; j != _end; j = (j + 1) % _size)
         newArr[i++] = _arr[j];
      delete[] _arr;
      _arr = newArr;
      _start = 0;
      _end = i;
      _size = newSize;
   }
   TValue& get(size_t index){ return _arr[indexToReal(index)];}
   TValue& operator[](size_t index){ return _arr[indexToReal(index)];}

   // 获取第index个元素的真实位置
   size_t indexToReal(size_t index){ return (_start + index) % _size;}
   // 获取真实位置的元素对应的index
   size_t realToIndex(size_t real){ return (real - _start + _size) % _size;}

protected:
   TValue *_arr;
   size_t _start = 0;
   size_t _end = 0;
   size_t _size;
};

template <typename TValue>
class SearchableRingBuffer : public RingBuffer<TValue>
{
public:
   SearchableRingBuffer() : RingBuffer<TValue>(){}
   SearchableRingBuffer(size_t bufferSize) : RingBuffer<TValue>(bufferSize){}

   void push(TValue data)
   {
      RingBuffer<TValue>::push(data);
      _set.insert(data);
   }
   void pop()
   {
      if (empty()) return;
      _set.erase(front());
      RingBuffer<TValue>::pop();
   }

   void clear()
   {
      RingBuffer<TValue>::clear();
      _set.clear();
   }

   bool has(const TValue &data)
   {
      return _set.find(data) != _set.end();
   }

   void resize(size_t newBufferSize)
   {
      RingBuffer<TValue>::resize(newBufferSize);
      _set.clear();
      for (size_t i = _start; i != _end; i = (i + 1) % _size)
         _set.insert(_arr[i]);
   }

protected:
   std::multiset<TValue> _set;
   using RingBuffer<TValue>::_arr;
   using RingBuffer<TValue>::_start;
   using RingBuffer<TValue>::_end;
   using RingBuffer<TValue>::_size;
   using RingBuffer<TValue>::empty;
   using RingBuffer<TValue>::front;
};

#endif