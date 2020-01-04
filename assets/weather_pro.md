## 配置项位置

在show节点-template,这是一个示例用的模板

```javascript
{
    title: `$[city] $[summary]`,
    subtitle: `$[weatherIcon]$[weather] $[temperature_min] ~ $[temperature_max]°C ☔️降雨概率 $[precipProbability]%`,
    detail: `空气质量 $[aqiIcon]$[aqi]($[aqiDesc]) $[windSpeed]km/h $[windDir]
👀紫外线指数 $[uv]($[uvDesc]) $[currentHumidity]
🌡体感温度 $[apparentTemperature_min] ~ $[apparentTemperature_max]°C
$[lifeStyle]`
}
```

## 说明

这个就相当于一个占位符

比如我要显示的内容是`北京 晴 --@wechatu`

则这里面包含了`城市名称` `天气描述` `diy任意文字`

我的模板就要写成

```
$[city] $[weather] --@wechatu
```



## 可配置的选项

|           配置项           |         功能         | 单位 |      示例值      |
| :------------------------: | :------------------: | :--: | :--------------: |
|        $[province]         |          省          |      |       江苏       |
|          $[city]           |          市          |      |       苏州       |
|        $[district]         |          区          |      |     工业园区     |
|         $[summary]         |   全天气候变化概述   |      | 晴朗将持续一整天 |
|       $[weatherIcon]       |       天气图标       |      |        ☀️         |
|         $[weather]         | 天气描述(晴/雨/雪等) |      |     晴转多云     |
|   $[currentTemperature]    |       当前温度       |  ℃   |        22        |
|     $[temperature_min]     |       温度低值       |  ℃   |        13        |
|     $[temperature_max]     |       温度高值       |  ℃   |        26        |
| $[apparentTemperature_min] |     体感温度低值     |  ℃   |        15        |
| $[apparentTemperature_max] |     体感温度高值     |  ℃   |        23        |
|    $[precipProbability]    |       降雨概率       |  %   |        90        |
|           $[aqi]           |       空气质量       |      |        45        |
|         $[aqiIcon]         |     空气质量图标     |      |        🟢         |
|         $[aqiDesc]         |     空气质量描述     |      |        优        |
|        $[windSpeed]        |       全天风速       | km/h |        15        |
|    $[currentWindSpeed]     |       当前风速       | km/h |        13        |
|         $[windDir]         |       全天风向       |      |      西北风      |
|     $[currentWindDir]      |       当前风向       |      |      东南风      |
|        $[windPower]        |     全天风力等级     |      |       3-4        |
|    $[currentWindPower]     |     当前风力等级     |      |       3-4        |
|        $[humidity]         |     全天相对湿度     |  %   |        30        |
|     $[currentHumidity]     |     当前相对湿度     |  %   |        30        |
|       $[atmosphere]        |      全天大气压      |  Pa  |       1030       |
|    $[currentAtmosphere]    |      当前大气压      |  Pa  |       1030       |
|       $[visibility]        |      全天能见度      |  km  |        10        |
|    $[currentVisibility]    |      当前能见度      |  km  |        10        |
|           $[uv]            |      紫外线指数      |      |        3         |
|         $[uvDesc]          |      紫外线描述      |      |    二级-较强     |
|         $[sunrise]         |       日出时间       |      |      07:36       |
|         $[sunset]          |       日落时间       |      |      16:58       |
|        $[moonrise]         |       月出时间       |      |      04:47       |
|         $[moonset]         |       月落时间       |      |      14:59       |
|        $[lifeStyle]        |       生活指数       |      |       ...        |
|                            |                      |      |                  |
|            more            |   更多内容等待更新   |      |                  |

