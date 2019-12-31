var api = "41d6c77e5eb84b4b8e45dd78cde082cd";
//dark sky api: https://darksky.net/dev
var api_aqi = "840cf4d18b54deed4a87720fe8db32065c0258cc"
//aqi api: http://aqicn.org/data-platform/token/#/
var lang = "zh"
var lat_lon = "31.247408,120.680860"
var lat_lon_1 = lat_lon.replace(/,/, ";")
var webhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=64033fad-6c65-4353-8096-2eef5b1c3e3c"; //整个研发
//var webhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0012b3dd-9ac3-4e8d-bc0b-cdf81d012c11"; //测试机器人

//有问题请通过Telegram反馈 https://t.me/Leped_Bot
//clear-day, partly-cloudy-day, cloudy, clear-night, rain, snow, sleet, wind, fog, or partly-cloudy-night
//☀️🌤⛅️🌥☁️🌦🌧⛈🌩🌨❄️💧💦🌫☔️☂️ ☃️⛄️
function weather() {
    var wurl = {
        url: "https://api.darksky.net/forecast/" + api + "/" + lat_lon + "?lang=" + lang + "&units=si&exclude=currently,minutely",
    };

    $task.fetch(wurl).then(response => {
        var obj = JSON.parse(response.body);
        //console.log(obj);
        var hour_summary = obj.hourly.summary;
        var icon_text = obj.hourly.icon;
        var icon = "❓"
        if (icon_text == "clear-day") icon = "☀晴";
        if (icon_text == "partly-cloudy-day") icon = "🌤晴转多云";
        if (icon_text == "cloudy") icon = "☁️多云";
        if (icon_text == "rain") icon = "🌧有雨";
        if (icon_text == "snow") icon = "☃️有雪";
        if (icon_text == "sleet") icon = "🌨雨夹雪";
        if (icon_text == "wind") icon = "🌬大风";
        if (icon_text == "fog") icon = "🌫大雾";
        if (icon_text == "partly-cloudy-night") icon = "🌑";
        if (icon_text == "clear-night") icon = "🌑";
        var daily_prec_chance = obj.daily.data[0].precipProbability;
        var daily_maxtemp = obj.daily.data[0].temperatureMax;
        var daily_mintemp = obj.daily.data[0].temperatureMin;
        aqi(icon, daily_mintemp, daily_maxtemp, daily_prec_chance, hour_summary);

    }, reason => {
        $notify("企业微信消息推送-天气", "获取天气信息失败", reason.error);
    });
}

function aqi(icon, daily_mintemp, daily_maxtemp, daily_prec_chance, hour_summary) {
    let aqi = {
        url: "https://api.waqi.info/feed/geo:" + lat_lon_1 + "/?token=" + api_aqi,
        headers: {},
    }
    $task.fetch(aqi).then(response => {
        var obj1 = JSON.parse(response.body);
        var aqi = obj1.data.aqi;
        bizNotify(icon, daily_mintemp, daily_maxtemp, daily_prec_chance, aqi, hour_summary);
    }, reason => {
        $notify("企业微信消息推送-天气", "获取空气质量失败", reason.error);
    });
}

function bizNotify(icon, daily_mintemp, daily_maxtemp, daily_prec_chance, aqi, hour_summary) {
    var aqiDesc = "";
    var aqiColor = "comment";
    if (aqi > 300) {
        aqiDesc = "重度污染";
        aqiColor = "warning"
    } else if (aqi > 200) {
        aqiDesc = "中度污染";
        aqiColor = "warning"
    } else if (aqi > 101) {
        aqiDesc = "轻度污染";
    } else if (aqi > 50) {
        aqiDesc = "良好";
    } else {
        aqiDesc = "优";
    }
    var markdownTips =
        `## ${new Date().getMonth()+1}月${new Date().getDate()}日  ${icon}
温度：<font color="comment">${Math.round(daily_mintemp)}℃ ~ ${Math.round(daily_maxtemp)}℃</font>
降雨概率：<font color="comment">${(Number(daily_prec_chance) * 100).toFixed(1)}%</font>
空气质量：<font color="${aqiColor}">${aqi}（${aqiDesc}）</font>
### <font color="info">${hour_summary}</font>`;
    var markdownObject = {
        msgtype: "markdown",
        markdown: {
            content: markdownTips
        }
    };
    var fetchObject = {
        url: webhookUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(markdownObject)
    }
    $task.fetch(fetchObject).then(response => {
        var obj = JSON.parse(response.body);
        var resultDesc = obj.errcode == 0 ? "推送成功" : "推送异常";
        $notify("企业微信消息推送-天气", resultDesc, JSON.stringify(obj));
    }, reason => {
        $notify("企业微信消息推送-天气", "推送失败", reason.error);
    })
}

weather()