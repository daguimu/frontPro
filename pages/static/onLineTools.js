sse();
document.addEventListener('drop', function (e) {
        e.preventDefault()
    }, false
)
document.addEventListener('dragover', function (e) {
        e.preventDefault()
    }, false
)
// var oDragWrap = document.body;
var oDragWrap = document.getElementById("uploadPlaceHolder");

//拖进
oDragWrap.addEventListener(
    "dragenter",
    function (e) {
        e.preventDefault();
    },
    false
)
;

//拖离
oDragWrap.addEventListener(
    "dragleave",
    function (e) {
        console.log("dragleave")
    },
    false
)
;

//拖来拖去 , 一定要注意dragover事件一定要清除默认事件
//不然会无法触发后面的drop事件
oDragWrap.addEventListener(
    "dragover",
    function (e) {
        e.preventDefault();
    },
    false
)
;

const dropHandler = function (e) {
    //将本地图片拖拽到页面中后要进行的处理都在这
    console.log("dropHandler 检测到文件拖入");

    e.preventDefault(); //获取文件列表

    const fileList = e.dataTransfer.files;

    //检测是否是拖拽文件到页面的操作
    if (fileList.length == 0) {
        return;
    }

    //检测文件是不是图片
    if (fileList[0].type.indexOf("image") === -1) {
        notImg();
        return;
    }
    //实例化file reader对象
    const file = fileList[0];
    preview(file);
    //进行上传
    let formData = new FormData();
    formData.append("file", file);
    uploadPic(formData);
};

function notImg() {
    $("#error").text("请选择一张图片!");
    $("#imgModal").modal('hide');
    // 用法
    sleep(300).then(() => {
        // 这里写sleep之后需要去做的事情
        $("#myModal").modal("show");
    })
}

//扔
oDragWrap.addEventListener(
    "drop",
    function (e) {
        dropHandler(e);
    },
    true
);

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function preview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $("#uploadPlaceHolder").attr("src", this.result);
    };
    reader.readAsDataURL(file);
}

function copyClick() {
    const input = document.querySelector('#res_html');
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        console.log('复制成功');
    }
}

function imgBed() {
    // 点击了上传图片按钮,进行img url 设置
    let IMG_URL = "https://tu.dagm.com/G2P4";
    $("#uploadPlaceHolder").attr("src", IMG_URL);
    if (!$("#copy").hasClass("disabled")) {
        $("#copy").addClass("disabled");
    }
    $("#res_html").val("");
    $("#imgModal").modal('show');
}

function uploadPicNoData() {
    let form = document.getElementById('upload');
    let formData = new FormData(form);
    const file = formData.get("file");
    //检测文件是不是图片
    if (file.type.indexOf("image") === -1) {
        notImg();
        return;
    }
    preview(file);
    uploadPic(formData);
}

function uploadPic(sendData) {
    let domain = "https://dagm.com/way/aplx";
    $("#loadingModal").modal('show');
    $.ajax({
        url: domain + "/upPic",
        type: "post",
        data: sendData,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res) {
                $('#loadingModal').modal('hide');
                if (true == res.success && res.data != undefined) {
                    $("#res_html").val(res.data)
                    $("#copy").removeClass("disabled");
                }
            }
            console.log(res);
        },
        error: function (err) {
            alert("网络连接失败,稍后重试", err);
        }
    })
}

document.querySelector("#imgModal").addEventListener("paste", function (e) {
        //添加监听paste事件
        var cbd = e.clipboardData;
        var ua = window.navigator.userAgent;
        if (!(e.clipboardData && e.clipboardData.items)) {
            return;
        }
        if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" && cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" && ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
            return;
        }
        for (var i = 0; i < cbd.items.length; i++) {
            var item = cbd.items[i];
            if (item.kind == "file") {
                var file = item.getAsFile();
                if (file.size === 0) {
                    return;
                }
                var data = new FormData();
                data.append("file", file);
                uploadPic(data);

            }
        }
    }, false
)
$("textarea").keydown(function (e) {
    if (e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        let start = this.selectionStart;
        let end = this.selectionEnd;

        let $this = $(this);
        let value = $this.val();

        // set textarea value to: text before caret + tab + text after caret
        $this.val(value.substring(0, start)
            + "\t"
            + value.substring(end));

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
    }
})
;


$(".real").click(function () {
    $("#loadingModal").modal('show');
    let url = "https://dagm.com/way/aplx/" + this.value;
    post(url, createdata(this.value), function (data) {
        resultFun(data);
    })
})
;

$(".dwz").click(function () {
    $("#loadingModal").modal('show');
    let tem = this.value;
    if ("restore" == this.value) {
        tem = "pro";
    }
    jsonPost(createdata(tem), this.value, function (data) {
        resultFun(data);
    })
})
;


function post(url, data, succfun
) {
    $.ajax({
        type: "POST",
        contentType: 'application/x-www-form-urlencoded',
        url: url,
        data: create(data),
        success: function (backda) {
            $('#loadingModal').modal('hide');
            succfun(backda);
        }
    });
}

function jsonPost(data, path, succfun
) {
    $.ajax({
        type: "POST",
        url: "https://dagm.com/way/shorter/inner/" + path,
        data: JSON.stringify({"url": data}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (backda) {
            $('#loadingModal').modal('hide');
            succfun(backda);
        }
    });
}

function create(data) {
    data = data.replace(/\t/g, " ");
    return {"sql": data};
}

function createdata(id) {
    if (id == "pro") {
        $("#hide").val("from");
        return $("#to").val();
    } else {
        $("#hide").val("to");
        return $("#from").val();
    }
}

function resultFun(data) {
    let id = $("#hide").val();
    if (data.success) {
        $("#" + id).val(data.data);
    } else {
        let start = data.msg.indexOf("错误信息:");
        let errmsg = start > 0 ? data.msg.slice(start + 5, -2) : data.msg;
        $("#error").text(errmsg);
        $("#myModal").modal("show");
    }
}

function generateUUID() {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        let c_start = document.cookie.indexOf(c_name + "=");//获取字符串的起点
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;//获取值的起点
            let c_end = document.cookie.indexOf(";", c_start);//获取结尾处
            if (c_end == -1) c_end = document.cookie.length;//如果是最后一个，结尾就是cookie字符串的结尾
            return decodeURI(document.cookie.substring(c_start, c_end));//截取字符串返回
        }
    }
    return "";
}

function setCookie(c_name, value, expiredays
) {
    var exdate = new Date();
    exdate.setTime(Number(exdate) + expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

function sse() {
    // let s = "";
    if (!!window.EventSource) {
        let uuid = getCookie("uuid");
        if (uuid == "") {
            uuid = generateUUID();
            setCookie("uuid", uuid);
        }
        let source = new EventSource('https://dagm.com/way/aplx/push/' + uuid);
        /* open事件回调函数 */
        source.onopen = evt => {
            //$("#notify").html("SSE通道已建立...<br/>");
        };
        source.onmessage = ev => {
            $("#notify").html(ev.data.slice(5));
        }

        /* error事件回调函数 */
        source.onerror = evt => {
            if (evt.target.readyState == EventSource.CLOSED) {
                $("#notify").html("SSE通道发生错误...");
            }
        }
        // 自定义响应事件 complete，主动关闭EventSource
        source.addEventListener('complete', function (e) {
            console.log("数据接收完毕，关闭EventSource");
            source.close();
            console.log(e);
        }, false);
    } else {
        console.log("你的浏览器不支持SSE");
    }
}
