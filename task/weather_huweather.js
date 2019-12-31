// by NobyDa

var coordinate = "auto_ip";
//以上填坐标

// var key = "faead3de5f42420098c8132b3924cd09";
var key = "5e7a7241a2e64c308ee3b650029b292e";
var wurl = {
    url: "https://free-api.heweather.net/s6/weather/now?&location=" + coordinate + "&key=" + key,
};

$task.fetch(wurl).then(response => {
        var obj = JSON.parse(response.body);
        var city = obj.HeWeather6[0].basic["parent_city"];
        var noweather = obj.HeWeather6[0].now["cond_txt"];
        var wind_dir = obj.HeWeather6[0].now["wind_dir"];
        var wind_sc = obj.HeWeather6[0].now["wind_sc"];
        var hum = obj.HeWeather6[0].now["hum"];
        var tmp = obj.HeWeather6[0].now["tmp"];
        var updatetime = obj.HeWeather6[0].update["loc"];

        var title = city + "天气 : "+ noweather +" ` " + tmp +" °C "
        var mation = "风向 : " + wind_dir + " · " + wind_sc + " 级"+"  湿度 : " + hum
        var update = "更新于 : " + updatetime
        $notify(title, mation, update);

}, reason => {
    $notify("错误", "", reason.error);
});