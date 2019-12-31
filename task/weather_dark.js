//dark sky api: https://darksky.net/dev
var api = "";//此处填写dark sky申请到的key

//aqi api: http://aqicn.org/data-platform/token/#/
var api_aqi = ""//此处填写aqi申请到的key

var lang = "zh"
var lat_lon = ""//此处填写经纬度,可以直接从google地图上获取,填写即可
var lat_lon_1 = lat_lon.replace(/,/, ";")


//clear-day, partly-cloudy-day, cloudy, clear-night, rain, snow, sleet, wind, fog, or partly-cloudy-night
//☀️🌤⛅️🌥☁️🌦🌧⛈🌩🌨❄️💧💦🌫☔️☂️ ☃️⛄️
function weather() {
    var wurl = {
        url: "https://api.darksky.net/forecast/" + api + "/" + lat_lon + "?lang=" + lang + "&units=si&exclude=currently,minutely",
    };


    $task.fetch(wurl).then(response => {
        let obj = JSON.parse(response.body);
        // console.log("天气数据获取-1", obj);
        let icon_text = obj.hourly.icon;
        let icon = "❓"
        if (icon_text == "clear-day") icon = "☀️晴";
        if (icon_text == "partly-cloudy-day") icon = "🌤晴转多云";
        if (icon_text == "cloudy") icon = "☁️多云";
        if (icon_text == "rain") icon = "🌧雨";
        if (icon_text == "snow") icon = "☃️雪";
        if (icon_text == "sleet") icon = "🌨雨夹雪";
        if (icon_text == "wind") icon = "🌬大风";
        if (icon_text == "fog") icon = "🌫大雾";
        if (icon_text == "partly-cloudy-night") icon = "🌑";
        if (icon_text == "clear-night") icon = "🌑";
        let weatherInfo = {
            icon,
            daily_prec_chance: obj.daily.data[0].precipProbability,
            daily_maxtemp: obj.daily.data[0].temperatureMax,
            daily_mintemp: obj.daily.data[0].temperatureMin,
            daily_windspeed: obj.daily.data[0].windSpeed,
            daily_uvIndex: obj.daily.data[0].uvIndex,
            hour_summary: obj.hourly.summary
        }
        // console.log(`天气数据获取-2-${JSON.stringify(weatherInfo)}`);
        aqi(weatherInfo);

    }, reason => {
        $notify("Dark Sky", lat_lon + '信息获取失败', reason.error);
    });
}

function aqi(weatherInfo) {
    const {
        icon,
        daily_prec_chance,
        daily_maxtemp,
        daily_mintemp,
        daily_windspeed,
        hour_summary,
        daily_uvIndex
    } = weatherInfo;
    let aqi = {
        url: "https://api.waqi.info/feed/geo:" + lat_lon_1 + "/?token=" + api_aqi,
        headers: {},
    }
    $task.fetch(aqi).then(response => {
        var obj1 = JSON.parse(response.body);
        // console.log(`天气数据获取-3-${JSON.stringify(obj1)}`);
        var aqi = obj1.data.aqi;
        var loc = obj1.data.city.name;
        loc = loc.split(",")[1];
        var aqiInfo = getAqiInfo(aqi);
        var weather = `${icon} ${Math.round(daily_mintemp)} ~ ${Math.round(daily_maxtemp)}℃  ☔️下雨概率 ${(Number(daily_prec_chance) * 100).toFixed(1)}%
😷空气质量 ${aqi}(${aqiInfo.aqiDesc}) 💨风速${daily_windspeed}km/h 
🌚紫外线指数${daily_uvIndex}(${getUVDesc(daily_uvIndex)})
${aqiInfo.aqiWarning?"Tips:":""}${aqiInfo.aqiWarning}`;
        $notify(loc, hour_summary, weather);
    }, reason => {
        $notify("Aqicn.org", lat_lon + '信息获取失败', reason.error);
    });
}

function getAqiInfo(aqi) {
    var aqiDesc = "";
    var aqiWarning = "";
    if (aqi > 300) {
        aqiDesc = "🟤严重污染";
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止户外活动";
    } else if (aqi > 200) {
        aqiDesc = "🟣重度污染";
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止或减少户外运动";
    } else if (aqi > 150) {
        aqiDesc = "🔴中度污染";
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群减少户外活动";
    } else if (aqi > 100) {
        aqiDesc = "🟠轻度污染";
        aqiWarning = "老人、儿童、呼吸系统等疾病患者减少长时间、高强度的户外活动";
    } else if (aqi > 50) {
        aqiDesc = "🟡良好";
        aqiWarning = "极少数敏感人群应减少户外活动";
    } else {
        aqiDesc = "🟢优";
    }
    return {
        aqi,
        aqiDesc,
        aqiWarning
    };
}

function getUVDesc(daily_uvIndex) {
    var uvDesc = "";
    if (daily_uvIndex >= 10) {
        uvDesc = "五级-特别强";
    } else if (daily_uvIndex >= 7) {
        uvDesc = "四级-很强";
    } else if (daily_uvIndex >= 5) {
        uvDesc = "三级-较强";
    } else if (daily_uvIndex >= 3) {
        uvDesc = "二级-较弱";
    } else {
        uvDesc = "一级-最弱";
    }
    return uvDesc;
}

weather()