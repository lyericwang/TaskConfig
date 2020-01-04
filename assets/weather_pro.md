## 配置项位置

在show节点-template,这是一个示例用的模板

```javascript
{
    title: `$[city] $[summary]`,
    subtitle: `$[weatherIcon]$[weather] $[temperature] $[precipProbability]`,
    detail: `$[aqi]($[aqiDesc]) $[windSpeed] $[windDir]
$[uv]($[uvDesc]) $[currentHumidity]
$[apparentTemperature]
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

|         配置项         |         功能         | 单位 |
| :--------------------: | :------------------: | :--: |
|        $[city]         |       城市名称       |      |
|       $[summary]       |   全天气候变化概述   |      |
|     $[weatherIcon]     |       天气图标       |      |
|       $[weather]       | 天气描述(晴/雨/雪等) |      |
| $[currentTemperature]  |       当前温度       |      |
|     $[temperature]     |       温度范围       |      |
| $[apparentTemperature] |     体感温度范围     |      |
|  $[precipProbability]  |       降雨概率       |      |
|         $[aqi]         |       空气质量       |      |
|       $[aqiDesc]       |     空气质量描述     |      |
|      $[windSpeed]      |       全天风速       |      |
|  $[currentWindSpeed]   |       当前风速       |      |
|       $[windDir]       |       全天风向       |      |
|   $[currentWindDir]    |       当前风向       |      |
|      $[windPower]      |       全天风力       |      |
|  $[currentWindPower]   |       当前风力       |      |
|      $[humidity]       |     全天相对湿度     |      |
|   $[currentHumidity]   |     当前相对湿度     |      |
|     $[atmosphere]      |      全天大气压      |      |
|  $[currentAtmosphere]  |      当前大气压      |      |
|     $[visibility]      |      全天能见度      |      |
|  $[currentVisibility]  |      当前能见度      |      |
|         $[uv]          |      紫外线指数      |      |
|       $[uvDesc]        |      紫外线描述      |      |
|       $[sunrise]       |       日出时间       |      |
|       $[sunset]        |       日落时间       |      |
|      $[moonrise]       |       月出时间       |      |
|       $[moonset]       |       月落时间       |      |
|      $[lifeStyle]      |       生活指数       |      |
|                        |                      |      |
|          more          |   更多内容等待更新   |      |

