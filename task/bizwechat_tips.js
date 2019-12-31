var markdownTips =
`## 开发小程序的小伙伴们注意啦
如果开发中遇到下列情况，请务必<font color="warning">通知安卓研发同事</font>
>调用了APP无法使用或需要特殊处理的方法:
><font color="comment">uni.getSetting()</font>/<font color="comment">uni.openSetting()</font>/<font color="comment">uni.authorize()</font>
><font color="comment">uni.hideShareMenu()</font><font color="info">(这个条件编译仅小程序使用就好啦)</font>
><font color="comment">uni.requestPayment()</font>
>涉及这些操作:
><font color="comment">分享功能的新增和调整</font>
><font color="comment">使用了Canvas</font>
><font color="comment">git合并冲突时强行覆盖</font>
>还有要避免:
><font color="comment">不要使用wx.***方法(除非页面仅小程序使用)</font>

[具体详情点击查看](http://git.17usoft.com/TC-Innovacation-DSF-USan/suprise-cat-shop#%E5%B0%8F%E7%A8%8B%E5%BA%8F-1)`
var markdownObject = {
    msgtype: "markdown",
    markdown: {
        content: markdownTips
    }
};
var webhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=64033fad-6c65-4353-8096-2eef5b1c3e3c"; //整个研发
//var webhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0012b3dd-9ac3-4e8d-bc0b-cdf81d012c11"; //测试机器人

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
    $notify("企业微信消息推送", resultDesc, "已成功提醒研发同事小程序的注意事项");
}, reason => {
    $notify("企业微信消息推送", "推送失败", reason.error);
})