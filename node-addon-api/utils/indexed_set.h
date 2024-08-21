#ifndef INDEXED_SET_H
#define INDEXED_SET_H

#include <map>
#include <vector>

// 限制最多有多少个hole，超过这个数目就开始回收
const size_t HOLE_LIMIT = 1000;

// 内部对value进行索引，可以通过value获取index，也可以通过index获取value
template <typename TValue>
class IndexedSet
{
public:
    IndexedSet(){};
    ~IndexedSet(){};

    size_t push(const TValue &value){
        if(valueToIndex.find(value) != valueToIndex.end()){
            auto index = valueToIndex[value];
            counts[index]++;
            // if index in holes, remove it
            holes.erase(index);
            return index;
        }

        size_t nextIndex = 0;
        if(holes.size() > HOLE_LIMIT){
            nextIndex = *holes.begin();
            holes.erase(nextIndex);

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
        size_t index = valueToIndex[value];
        erase_by_index(index);
    }

    void erase_by_index(size_t index){
        if(counts[index] > 0) counts[index]--;
        if(counts[index] <= 0){
            const auto &value = indexToValue[index];
            if(valueToIndex.find(value) != valueToIndex.end())
                valueToIndex.erase(indexToValue[index]);
            holes.insert(index);
        }
    }

    // 只要还没有被回收，就可以通过index获取value
    size_t get_index(const TValue &value){
        if(valueToIndex.find(value) == valueToIndex.end())
            return -1;
        return valueToIndex[value];
    }

    TValue& get_value(size_t index){
        return indexToValue[index];
    }

    size_t size(){ return valueToIndex.size(); }
protected:
    std::map<TValue, size_t> valueToIndex;
    std::vector<TValue> indexToValue;
    std::vector<int> counts;
    std::set<size_t> holes;
};

#endif