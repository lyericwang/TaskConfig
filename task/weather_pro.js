/*
具体配置可见
https://github.com/sazs34/TaskConfig#%E5%A4%A9%E6%B0%94
 */
let config = {
    darksky_api: "", //从https://darksky.net/dev/ 上申请key填入即可
    aqicn_api: "", //从http://aqicn.org/data-platform/token/#/ 上申请key填入即可
    huweather_apiKey: "", //和风天气APIkey,可自行前往 https://dev.heweather.com/ 进行获取
    lat_lon: "", //请填写经纬度,直接从谷歌地图中获取即可
    lang: "zh", //语言,请不要修改
    log: 2, //调试日志,0为不开启,1为开启,2为开启精简日志
    useParallel: 1, //接口读取方式:0并行1串行(1的速度比较快,0的速度稍慢一些,暂时直接用1就好了)
    show: {
        template: {
            title: `$[city] $[summary]`,
            subtitle: `$[weatherIcon]$[weather] $[temperature_min] ~ $[temperature_max]℃ ☔️降雨概率 $[precipProbability]％`,
            detail: `🥵空气质量 $[aqi]($[aqiDesc]) $[windSpeed] $[windDir]
👀紫外线指数 $[uv]($[uvDesc]) $[currentHumidity]
🌡体感温度 $[apparentTemperature_min] ~ $[apparentTemperature_max]℃
$[lifeStyle]`
        },
        lifestyle: { //此处用于显示各项生活指数，可自行调整顺序，顺序越在前面则显示也会靠前，如果您不想查看某一指数，置为false即可，想看置为true即可
            comf: true, //舒适度指数,
            cw: false, //洗车指数,
            drsg: true, //穿衣指数,
            flu: true, //感冒指数,
            sport: false, //运动指数,
            trav: false, //旅游指数,
            uv: true, //紫外线指数,
            air: false, //空气污染扩散条件指数,
            ac: false, //空调开启指数,
            ag: false, //过敏指数,
            gl: false, //太阳镜指数,
            mu: false, //化妆指数,
            airc: false, //晾晒指数,
            ptfc: false, //交通指数,
            fsh: false, //钓鱼指数,
            spi: false, //防晒指数
        }
    }
}

var weatherInfo = {
    check: { //用于检测接口是否处理完成
        darksky: 0,
        aqicn: 0,
        heweathernow: 0,
        heweatherdaily: 0,
        lifestyle: 0,
    },
    darksky: {
        daily: {},
        hourly: {}
    },
    aqicn: {
        data: {},
        aqiInfo: {}
    },
    heweather: {
        basic: {},
        now: {},
        daily: {},
        lifestyle: []
    }
};
// #region 天气数据获取
function weather() {
    heweatherNow();
    if (config.useParallel == 1) {
        heweatherDaily();
        darksky();
        aqicn();
        heweatherLifestyle();
    }
}
//clear-day, partly-cloudy-day, cloudy, clear-night, rain, snow, sleet, wind, fog, or partly-cloudy-night
//☀️🌤⛅️🌥☁️🌦🌧⛈🌩🌨❄️💧💦🌫☔️☂️ ☃️⛄️
function darksky() {
    var durl = {
        url: `https://api.darksky.net/forecast/${config.darksky_api}/${config.lat_lon}?lang=${config.lang}&units=si&exclude=currently,minutely`
    };

    $task.fetch(durl).then(response => {
        try {
            let darkObj = JSON.parse(response.body);
            record(`天气数据获取-A1-${response.body}`);
            if (darkObj.error) {
                $notify("DarkApi", "出错啦", darkObj.error);
            }
            weatherInfo.darksky.daily = darkObj.daily.data[0];
            weatherInfo.darksky.hourly = darkObj.hourly;
            record(`天气数据获取-A2-${JSON.stringify(weatherInfo)}`);
            check('darksky', true)
        } catch (e) {
            console.log(`天气数据A获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-A3-${reason.error}`);
        check('lifestyle', false);
        $notify("Dark Sky", '信息获取失败', reason.error);
    });
}

function aqicn() {
    let aurl = {
        url: `https://api.waqi.info/feed/geo:${config.lat_lon.replace(/,/, ";")}/?token=${config.aqicn_api}`,
        headers: {},
    }
    $task.fetch(aurl).then(response => {
        try {
            var waqiObj = JSON.parse(response.body);
            if (waqiObj.status == 'error') {
                $notify("Aqicn", "出错啦", waqiObj.data);
            } else {
                record(`天气数据获取-B1-${response.body}`);
                weatherInfo.aqicn.data = waqiObj.data;
                weatherInfo.aqicn.aqiInfo = {
                    ...getAqiInfo(waqiObj.data.aqi)
                };
            }
            check('waqi', true)
        } catch (e) {
            console.log(`天气数据B获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-B2-${reason.error}`);
        //确保最大成功率吧,不然其中一个接口挂掉了就全部崩了,很难受
        check('waqi', false)
    });
}

function heweatherNow() {
    var hurl = {
        url: `https://free-api.heweather.net/s6/weather/now?location=${config.lat_lon}&key=${config.huweather_apiKey}`,
    };

    $task.fetch(hurl).then(response => {
        try {
            record(`天气数据获取-C1-${response.body}`);
            var heObj = JSON.parse(response.body);
            weatherInfo.heweather.basic = heObj.HeWeather6[0].basic;
            weatherInfo.heweather.now = heObj.HeWeather6[0].now;
            check('heweathernow', true)
        } catch (e) {
            console.log(`天气数据C获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-C2-${reason.error}`);
        //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
        check('heweathernow', false)
    })
}

function heweatherDaily() {
    var hurl = {
        url: `https://free-api.heweather.net/s6/weather/forecast?location=${config.lat_lon}&key=${config.huweather_apiKey}`,
    };

    $task.fetch(hurl).then(response => {
        try {
            record(`天气数据获取-D1-${response.body}`);
            var heObj = JSON.parse(response.body);
            weatherInfo.heweather.daily = heObj.HeWeather6[0].daily_forecast[0];
            check('heweatherdaily', true)
        } catch (e) {
            console.log(`天气数据D获取报错${JSON.stringify(e)}`)
        }
    }, reason => {
        record(`天气数据获取-D2-${reason.error}`);
        //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
        check('heweatherdaily', false)
    })
}

function heweatherLifestyle() {
    var needRequest = false;
    //判断一下是否全部都是false,全false的话,则不需要请求此接口直接返回渲染的数据了
    for (var item in config.show.lifestyle) {
        if (config.show.lifestyle[item]) {
            needRequest = true;
            break;
        }
    }
    if (needRequest) {
        var hurl = {
            url: `https://free-api.heweather.net/s6/weather/lifestyle?location=${config.lat_lon}&key=${config.huweather_apiKey}`,
        };

        $task.fetch(hurl).then(response => {
            try {
                record(`天气数据获取-E1-${response.body}`);
                var heObj = JSON.parse(response.body);
                weatherInfo.heweather.lifestyle = heObj.HeWeather6[0].lifestyle;
                check('lifestyle', true)
            } catch (e) {
                console.log(`天气数据E获取报错${JSON.stringify(e)}`)
            }
        }, reason => {
            record(`天气数据获取-E2-${reason.error}`);
            //因为此接口出错率还挺高的,所以即使报错我们也不处理,该返回什么就返回什么好了
            check('lifestyle', false)
        })
    } else {
        check('lifestyle', false)
    }
}
//#endregion

// #region 提醒数据组装
function check(type, result) {
    record(`check-${type}-${config.useParallel}-${result}`);
    switch (type) {
        case "heweathernow":
            weatherInfo.check.heweathernow = result ? 1 : 2;
            if (config.useParallel == 0) heweatherDaily();
            break;
        case "heweatherdaily":
            weatherInfo.check.heweatherdaily = result ? 1 : 2;
            if (config.useParallel == 0) darksky();
            break;
        case "darksky":
            weatherInfo.check.darksky = result ? 1 : 2;
            if (config.useParallel == 0) waqi();
            break;
        case "waqi":
            weatherInfo.check.aqicn = result ? 1 : 2;
            if (config.useParallel == 0) heweatherLifestyle()
            break;
        case "lifestyle":
            weatherInfo.check.lifestyle = result ? 1 : 2;
            break;
    }
    var isAllChecked = weatherInfo.check.heweathernow != 0 && weatherInfo.check.heweatherdaily != 0 && weatherInfo.check.darksky != 0 && weatherInfo.check.aqicn != 0 && weatherInfo.check.lifestyle != 0;
    if (isAllChecked) {
        record(`天气数据渲染中[template]`);
        try {
            renderTemplate();
        } catch (e) {
            record(`天气渲染出错-${JSON.stringify(e)}`);
        }
    }
}

var lineBreak = `
`;

function renderTemplate() {
    const map = {
        //城市名称
        city: weatherInfo.heweather.basic.location || getCityInfo(weatherInfo.aqicn.data.city.name) || "UNKNOW",
        //全天气候变化概述
        summary: `${weatherInfo.darksky.hourly.summary}`,
        weatherIcon: `${getHeweatherIcon(weatherInfo.heweather.now.cond_code)||getDarkskyWeatherIcon(weatherInfo.darksky.hourly.icon)}`,
        //天气描述(晴/雨/雪等)
        weather: `${weatherInfo.heweather.now.cond_txt||getDarkskyWeatherDesc(weatherInfo.darksky.hourly.icon)}`,
        //当前温度
        currentTemperature: `${weatherInfo.heweather.now.tmp}`,
        //温度最低值
        temperature_min: `${Math.round(weatherInfo.heweather.daily.tmp_min||weatherInfo.darksky.daily.temperatureMin}`,
        //温度最高值
        temperature_max: `${Math.round(weatherInfo.heweather.daily.tmp_max||weatherInfo.darksky.daily.temperatureMax)}`,
        //体感温度最低值
        apparentTemperature_min: `${Math.round(weatherInfo.darksky.daily.apparentTemperatureLow)}`,
        //体感温度最高值
        apparentTemperature_max: `${Math.round(weatherInfo.darksky.daily.apparentTemperatureHigh)}`,
        //降雨概率
        precipProbability: `${weatherInfo.heweather.daily.pop||(Number(weatherInfo.darksky.daily.precipProbability) * 100).toFixed(0)}`,
        //空气质量
        aqi: `${weatherInfo.aqicn.aqiInfo.aqi||"UNKNOW"}`,
        //空气质量描述
        aqiDesc: `${weatherInfo.aqicn.aqiInfo.aqiDesc}`,
        //全天风速
        windSpeed: `${weatherInfo.heweather.daily.wind_spd}`,
        //当前风速
        currentWindSpeed: `${weatherInfo.heweather.now.wind_spd}`,
        //全天风向
        windDir: `${weatherInfo.heweather.daily.wind_dir}`,
        //当前风向
        currentWindDir: `${weatherInfo.heweather.now.wind_dir}`,
        //全天风力
        windPower: `${weatherInfo.heweather.daily.wind_sc}`,
        //当前风力
        currentWindPower: `${weatherInfo.heweather.now.wind_sc}`,
        //全天相对湿度
        humidity: `${weatherInfo.heweather.daily.hum}%`,
        //当前相对湿度
        currentHumidity: `${weatherInfo.heweather.now.hum}%`,
        //全天大气压
        atmosphere: `${weatherInfo.heweather.daily.pres}Pa`,
        //当前大气压
        currentAtmosphere: `${weatherInfo.heweather.now.pres}Pa`,
        //全天能见度
        visibility: `${weatherInfo.heweather.daily.vis}km`,
        //当前能见度
        currentVisibility: `${weatherInfo.heweather.now.vis}km`,
        //紫外线等级
        uv: `${weatherInfo.heweather.daily.uv_index||weatherInfo.darksky.daily.uvIndex}`,
        //紫外线描述
        uvDesc: `${getUVDesc(weatherInfo.heweather.daily.uv_index||weatherInfo.darksky.daily.uvIndex)}`,
        //日出时间
        sunrise: `${weatherInfo.heweather.daily.sr}`,
        //日落时间
        sunset: `${weatherInfo.heweather.daily.ss}`,
        //月出时间
        moonrise: `${weatherInfo.heweather.daily.mr}`,
        //月落时间
        moonset: `${weatherInfo.heweather.daily.ms}`,
        //生活指数
        lifeStyle: getLifeStyle()
    }
    var notifyInfo = {
        title: execTemplate(config.show.template.title, map),
        subtitle: execTemplate(config.show.template.subtitle, map),
        detail: execTemplate(config.show.template.detail, map),
    };
    $notify(notifyInfo.title, notifyInfo.subtitle, notifyInfo.detail);
}
// #endregion

// #region 辅助方法
function getHeweatherIcon(code) {
    var codeMap = {
        _100: '☀️',
        _101: '☁️',
        _102: '☁️',
        _103: '⛅️',
        _104: '☁️',
        _200: '💨',
        _201: '🌬',
        _202: '🌬',
        _203: '🌬',
        _204: '🌬',
        _205: '🌬',
        _206: '💨',
        _207: '💨',
        _208: '💨',
        _209: '🌪',
        _210: '🌪',
        _211: '🌪',
        _212: '🌪',
        _213: '🌪',
        _300: '🌨',
        _301: '🌨',
        _302: '⛈',
        _303: '⛈',
        _304: '⛈',
        _305: '💧',
        _306: '💦',
        _307: '🌧',
        _308: '🌧',
        _309: '☔️',
        _310: '🌧',
        _311: '🌧',
        _312: '🌧',
        _313: '🌧❄️',
        _314: '💧',
        _315: '💦',
        _316: '🌧',
        _317: '🌧',
        _318: '🌧',
        _399: '🌧',
        _400: '🌨',
        _401: '🌨',
        _402: '☃️',
        _403: '❄️',
        _404: '🌨',
        _405: '🌨',
        _406: '🌨',
        _407: '🌨',
        _408: '🌨',
        _409: '🌨',
        _410: '❄️',
        _499: '⛄️',
        _500: '🌫',
        _501: '🌫',
        _502: '🌫',
        _503: '🌫',
        _504: '🌫',
        _505: '🌫',
        _506: '🌫',
        _507: '🌫',
        _508: '🌫',
        _509: '🌫',
        _510: '🌫',
        _511: '🌫',
        _512: '🌫',
        _513: '🌫',
        _514: '🌫',
        _515: '🌫',
        _900: '🔥',
        _901: '⛄️',
        _999: '❓',
    }
    return codeMap[`_${code}`] ? codeMap[`_${code}`] : "";
}

function getDarkskyWeatherIcon(icon_text) {
    let icon = "❓"
    if (icon_text == "clear-day") icon = "☀️";
    if (icon_text == "partly-cloudy-day") icon = "🌤";
    if (icon_text == "cloudy") icon = "☁️";
    if (icon_text == "rain") icon = "🌧";
    if (icon_text == "snow") icon = "☃️";
    if (icon_text == "sleet") icon = "🌨";
    if (icon_text == "wind") "🌬";
    if (icon_text == "fog") icon = "🌫";
    if (icon_text == "partly-cloudy-night") icon = "🌑";
    if (icon_text == "clear-night") icon = "🌑";
    return icon;
}

function getDarkskyWeatherDesc(icon_text) {
    let icon = "未知"
    if (icon_text == "clear-day") icon = `晴`;
    if (icon_text == "partly-cloudy-day") icon = `晴转多云`;
    if (icon_text == "cloudy") icon = `多云`;
    if (icon_text == "rain") icon = `雨`;
    if (icon_text == "snow") icon = `雪`;
    if (icon_text == "sleet") icon = `雨夹雪`;
    if (icon_text == "wind") icon = `大风`;
    if (icon_text == "fog") icon = `大雾`;
    if (icon_text == "partly-cloudy-night") icon = `多云`;
    if (icon_text == "clear-night") icon = `晴`;
    return icon;
}

function getCityInfo(name) {
    var loc;
    try {
        var locArr = name.split(/[(),，（）]/)
        if (locArr.length >= 4) {
            loc = locArr[2] + " ";
        } else if (locArr.length >= 2) {
            loc = locArr[1] + " ";
        } else {
            loc = ""; //此时会很长,还不如不显示了
        }
    } catch (e) {
        loc = '';
        record(`获取城市名称失败-${JSON.stringify(e)}`);
    }
    return loc;
}

function getAqiInfo(aqi) {
    var aqiDesc = "";
    var aqiWarning = "";
    if (aqi > 300) {
        aqiDesc = `🟤严重污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止户外活动";
    } else if (aqi > 200) {
        aqiDesc = `🟣重度污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群停止或减少户外运动";
    } else if (aqi > 150) {
        aqiDesc = `🔴中度污染`;
        aqiWarning = "儿童、老人、呼吸系统等疾病患者及一般人群减少户外活动";
    } else if (aqi > 100) {
        aqiDesc = `🟠轻度污染`;
        aqiWarning = "老人、儿童、呼吸系统等疾病患者减少长时间、高强度的户外活动";
    } else if (aqi > 50) {
        aqiDesc = `🟡良好`;
        aqiWarning = "极少数敏感人群应减少户外活动";
    } else {
        aqiDesc = `🟢优`;
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

function getLifeStyle() {
    var lifeStyle = '';
    if (weatherInfo.heweather.lifestyle && weatherInfo.heweather.lifestyle.length > 0) {
        console.log("指数信息-" + JSON.stringify(weatherInfo.lifeStyle));
        for (var item in config.show.lifestyle) {
            if (config.show.lifestyle[item]) {
                var youAreTheOne = weatherInfo.heweather.lifestyle.filter(it => it.type == item);
                if (youAreTheOne && youAreTheOne.length > 0) {
                    console.log("指数信息-choose-" + JSON.stringify(youAreTheOne));
                    lifeStyle += `${lifeStyle==""?"":lineBreak}${config.show.icon?'💡':''}[${youAreTheOne[0].brf}]${youAreTheOne[0].txt}`;
                }
            }
        }
    }
    return lifeStyle;
}

function execTemplate(template, map) {
    if (!template) return "";
    let regex = /\$\[([a-z,A-Z,0-9]*)\]/g;
    for (item of template.match(regex)) {
        item.match(regex);
        if (RegExp.$1 && map[RegExp.$1]) {
            template = template.replace(item, map[RegExp.$1]);
        } else {
            template = template.replace(item, "");
        }
    }
    return template;
}

function record(log) {
    if (config.log == 1) {
        console.log(log);
    } else if (config.log == 2) {
        console.log(log.substring(0, 60));
    }
}
// #endregion

weather();