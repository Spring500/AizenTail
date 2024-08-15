#ifndef INDEXED_SET_H
#define INDEXED_SET_H

#include <map>
#include <vector>

// 限制最多有多少个hole，超过这个数目就开始回收
const int HOLE_LIMIT = 1000;

// 内部对value进行索引，可以通过value获取index，也可以通过index获取value
template <typename TValue>
class IndexedSet
{
public:
    IndexedSet(){};
    ~IndexedSet(){};

    int push(const TValue &value){
        if(valueToIndex.find(value) != valueToIndex.end()){
            auto index = valueToIndex[value];
            counts[index]++;
            return -1;
        }

        int nextIndex = 0;
        if(holes.size() > HOLE_LIMIT){
            nextIndex = holes.back();
            holes.pop_back();
            auto oldValue = indexToValue[nextIndex];
            if(valueToIndex.find(oldValue) != valueToIndex.end())
                valueToIndex.erase(oldValue);
        } else{
            while(nextIndex < counts.size() && counts[nextIndex] > 0)
                nextIndex++;
        }

        if(indexToValue.size() <= nextIndex)
            indexToValue.resize(nextIndex + 10);
        if(counts.size() <= nextIndex)
            counts.resize(nextIndex + 10);

        valueToIndex.insert({value, nextIndex});
        indexToValue[nextIndex] = value;
        counts[nextIndex] = 1;
        return nextIndex;
    }

    void erase(const TValue &value){
        if(valueToIndex.find(value) == valueToIndex.end())
            return;
        int index = valueToIndex[value];
        erase_by_index(index);
    }

    void erase_by_index(int index){
        if(counts[index] <= 0) return;
        counts[index]--;
        if(counts[index] <= 0)
            holes.push_back(index);
    }

    // 只要还没有被回收，就可以通过index获取value
    int get_index(const TValue &value){
        if(valueToIndex.find(value) == valueToIndex.end())
            return -1;
        return valueToIndex[value];
    }

    TValue& get_value(int index){
        return indexToValue[index];
    }

    int size(){ return valueToIndex.size(); }
public:
    std::map<TValue, int> valueToIndex;
    std::vector<TValue> indexToValue;
    std::vector<int> counts;
    std::vector<int> holes;
};

#endif