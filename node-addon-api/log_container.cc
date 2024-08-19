#include "log_container.h"
#include "utils/macros.h"
#include <sstream>
#include <exception>
#include <regex>
#include <napi.h>

void LogContainer::pop_log()
{
    if(size() <= 0) return;
    // 如果删除的是满足筛选条件的日志(必定是筛选后日志的第一行)，则删除筛选后列表中的对应行
    if(filtedLines.get(0) == logs.indexToReal(0))
        filtedLines.pop();
    logs.pop();
}

void LogContainer::push_log(std::string log)
{
    if(logs.full()) pop_log();
    logs.push({log});
    
    const auto index = logs.size() - 1;
    if(check_log(logs.get(index)))
        filtedLines.push(logs.indexToReal(index));
}

void LogContainer::clear_rules()
{
    for(auto &rule : rules)
        patterns.erase_by_index(rule.patternIndex);
    rules.clear();

    for(int i = 0; i < logs.size(); i++) {
        logs.get(i).results.clear();
    }
}

std::string LogContainer::get_log(int line)
{
    return logs.get(line).text;
}

std::string LogContainer::get_filted_log(int line)
{
    const auto realIndex = filtedLines.get(line);
    return logs.get(logs.realToIndex(realIndex)).text;
}

bool LogContainer::is_filtered(int line)
{
    const auto realIndex = logs.indexToReal(line);
    return filtedLines.has(realIndex);
}

void LogContainer::clear()
{
    logs.clear();
    filtedLines.clear();
}

void LogContainer::refresh_rules()
{
    filtedLines.clear();
    if(rules.size() == 0){
        for(int i = 0; i < logs.size(); i++)
            filtedLines.push(logs.indexToReal(i));
        return;
    }
    for(int i = 0; i < logs.size(); i++) {
        for(const auto &rule : rules){
            const auto pattern_index = rule.patternIndex;
            const auto &pattern = patterns.get_value(pattern_index);
            if(check_one_rule(pattern, pattern_index, logs.get(i))) {
                const auto realIndex = logs.indexToReal(i);
                filtedLines.push(realIndex);
            }
        }
    }
}

int LogContainer::get_index(const int line)
{
    if(line < 0 || line >= filtedLines.size())
        return -1;
    const auto realIndex = filtedLines.get(line);
    return logs.realToIndex(realIndex);
}


bool LogContainer::check_one_rule(const MatchPattern &pattern, const int pattern_index, LogData &data)
{
    auto &results = data.results;
    if (results.size() <= pattern_index)
        results.resize(pattern_index + 1, UNKNOWN);
    
    if(results[pattern_index] != UNKNOWN){
        return results[pattern_index] == MATCHED;
    }
    bool result = false;
    if(pattern.isRegex) {
        std::regex::flag_type flag = std::regex::ECMAScript;
        if(pattern.ignoreCase) flag |= std::regex::icase;
        std::regex reg(pattern.text, flag);
        result = std::regex_search(data.text, reg);
    } else {
        // TODO: 暂未实现非正则匹配的忽略大小写
        if (pattern.ignoreCase) {
            result = data.text.find(pattern.text) != std::string::npos;
        } else {
            result = data.text.find(pattern.text) != std::string::npos;
        }
    }
    results[pattern_index] = result ? MATCHED : NOT_MATCHED;
    return result;
}


bool LogContainer::check_log(LogData &data)
{
    if(rules.size() == 0) return true;
    for(const auto &rule : rules) {
        const auto pattern_index = rule.patternIndex;
        const auto pattern = patterns.get_value(pattern_index);
        const auto result = check_one_rule(pattern, pattern_index, data);
        if(rule.isExclude && !result) return false;
        if(!rule.isExclude && result) return true;
    }
    return false;
}
