var global_pid = "";
var storageData = localStorage.weiboData ? JSON.parse(localStorage.weiboData) : [];
var https = localStorage.is_https ? JSON.parse(localStorage.is_https) : $("#https").is(':checked');
var http_pre  = "http://ww";
var https_pre = "https://ws";


var Wbpd = Wbpd || {};
Wbpd.prototype={
    is_batch:$(this).data('batch')|0,//褰撳墠鏄惁鏄壒閲忔ā寮�
    xhr_arr:[],//鐢ㄦ潵璁板綍xhr瀵硅薄,鍚庨潰鐢ㄦ潵鍋歛bort鎿嶄綔
    pic_num:0,//鐢ㄦ潵璁板綍涓婁紶鏂囦欢鐨勬€讳釜鏁�,鍚庨潰閫掑噺鏉ュ垽鏂槸鍚︿笂浼犲畬鎴�
    init:function(){
        $('input').prop('spellcheck', false);
        $("#optionPage").click(function() {
            event.preventDefault();
            chrome.tabs.create({url:Wbpd.prototype.options_url});
            window.close();
        });
        //鎵归噺妯″紡鎸夐挳
        // 鎵归噺妯″紡,0鍏抽棴,1寮€鍚�
        $(".btn-batch").on("click",function () {
            Wbpd.prototype.toggleBatch();
        });
        $('#https').attr('checked',https);//璁颁綇涓婃鐨勮瀹�
        $("#https").on("click",function () {
            localStorage.is_https=$("#https").is(':checked');
        });

        //缁欐墍鏈夊浘鐗�,甯︽湁clicker鐨勫叏閮ㄥ姞涓婇紶鏍囨粦鍔ㄤ簨浠跺拰鐐瑰嚮浜嬩欢
        $('body').on('mouseenter', '.clicker', function() {
            var img_url = $(this).parent().nextAll().find('#res_img').data('url');

            if (img_url != '' && img_url != undefined && $(this).attr('data-url') != 1) {
                $(this).prop('src', img_url);
                $(this).attr('data-url', 1);
            }
        }).on("click", '.clicker', function() {
            $('#input').trigger('click');
        });
        //鍗曞浘妯″紡涓嬬殑"澶嶅埗"鎸夐挳 鍜屾壒閲忔ā寮忎笅鐨�"涓€閿鍒�"鎸夐挳,娣诲姞榧犳爣鍒掕繃绉婚櫎data-tooltip
        $(".btn-copy,.btn-batchcopy").hover(
            function() {
                $(this).removeAttr('data-tooltip');
            },
            function() {
                $(this).blur();
            }
        );
        //鍗曞浘妯″紡涓嬬殑"澶嶅埗"鎸夐挳,娣诲姞鐐瑰嚮浜嬩欢
        $(".btn-copy").on("click", function() {
            event.preventDefault();
            $(this).prev().select();
            var dataToCpy = $(this).prev().val();
            document.execCommand('copy');
            $(this).attr("data-tooltip", "澶嶅埗鎴愬姛"); //data-tooltip="澶嶅埗鎴愬姛"
            document.getSelection().removeAllRanges();
        });
        //鎵归噺妯″紡涓�,缁欐墍鏈夊浘鐗囨坊鍔犻紶鏍囨粦鍔ㄤ簨浠�
        $(".batch-model").on('mouseenter', '.batch-img', function() {
            var img_url = $(this).nextAll().find('.batch-url').data('url');

            if (img_url != '' && img_url != undefined && $(this).attr('data-url') != 1) {
                $(this).prop('src', img_url);
                $(this).attr('data-url', 1);
            }
        });
        // //鎵归噺妯″紡涓�,缁欐墍鏈夊浘鐗囨坊鍔犵偣鍑讳簨浠�
        // $(".batch-model").on('click', '.batch-img',function() {
        //         $('#input').trigger('click');
        //     }
        // );
        //"鎵归噺妯″紡"涓嬫墍鏈夌殑鍦板潃妗�,娣诲姞榧犳爣鍒掕繃绉婚櫎data-tooltip
        $(".batch-model").on('mouseenter', '.batch-url', function() {
            $(this).parent().removeAttr('data-tooltip');
        }).on('mouseleave', '.batch-url', function() {
            $(this).blur();
        });
        //淇敼鍥剧墖灏哄鍜岃繑鍥炲唴瀹规牸寮�,缁戝畾鍚屼竴涓簨浠�
        $(".btn-size,.btn-format").on("click", function() {
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');
            if (global_pid != "") {
                if (Wbpd.prototype.is_batch > 0) { //濡傛灉鏄壒閲忔ā寮�,姝ゅ寰幆鎵ц
                    var img_length = $('.batch-model img').length;
                    for (var i = 0; i < img_length; i++) {
                        Wbpd.prototype.changePicFormat($('#res' + i).data('params'), i);
                    }

                } else {
                    Wbpd.prototype.changePicFormat($('#res_img').data('params'));
                }
            }
        });
        //鎵归噺妯″紡涓�,鐐瑰嚮鍙夊弶鍒犻櫎浜嬩欢
        $(".batch-model").on('click', '.fancybox-close', function() {
            if ($(this).parent().parent().children().length == 1) {
                $(this).parent().remove();
                Wbpd.prototype.clearData();
            } else {
                $(this).parent().remove();
            }
        });
        //鎵归噺妯″紡涓�,鍦板潃妗嗙殑鑾峰彇鐒︾偣浜嬩欢
        $(".batch-model").on('focus', '.batch-url', function() {
            event.preventDefault();
            $(this).select();
            var dataToCpy = $(this).val();
            document.execCommand('copy');
            $(this).parent().attr("data-tooltip", "澶嶅埗鎴愬姛"); //data-tooltip="澶嶅埗鎴愬姛"
            document.getSelection().removeAllRanges();
        });
        //鎵归噺妯″紡涓�,鍦板潃妗嗙殑鑾峰彇鐒︾偣浜嬩欢
        $(".res").hover(
            function() {
                $(this).select();
            },
            function() {
                $(this).blur();
            }
        );
        //鎵归噺妯″紡涓�,涓€閿鍒舵墍鏈�,娣诲姞鐐瑰嚮浜嬩欢
        $('.btn-batchcopy').click(function() {
            var url_list = [];
            $('.batch-img').each(function() {
                url_list.push($(this).nextAll().find('.batch-url').val());
            });
            var text = url_list.join('\n');
            var copyFrom = $('<textarea id="copyFrom"/>');
            copyFrom.css({
                position: "absolute",
                left: "-1000px",
                top: "-1000px",
            });
            copyFrom.text(text);
            $('body').append(copyFrom);
            copyFrom.select();
            document.execCommand('copy');
            $(copyFrom).remove();
            $(this).attr("data-tooltip", "澶嶅埗鎴愬姛");
        });

        $("body").on({
            dragleave: function(e) {
                e.preventDefault();
                // e.stopPropagation();
            },
            drop: function(e) {
                e.preventDefault();
                // e.stopPropagation();
            },
            dragenter: function(e) {
                e.preventDefault();
                // e.stopPropagation();
            },
            dragover: function(e) {
                e.preventDefault();
                // e.stopPropagation();
            }
        });

        //exit with ESC press
        $(document).keydown(function(event) {
            if (event.keyCode == 27) {
                window.close();
            }
        });

        //姝ゅ鏄墜鍔ㄩ€夋嫨鏂囦欢
        $('#input').change(function() {
            event.preventDefault();
            var filesToUpload = document.getElementById('input').files;
            var img_file = [];
            for (var i = 0; i < filesToUpload.length; i++) {
                var file = filesToUpload[i];
                if (/image\/\w+/.test(file.type) && file != "undefined") {
                    img_file.push(file);
                }
            }
            Wbpd.prototype.getImageFile(img_file, filesToUpload.length);
        });

        //姝ゅ鏄嫋鎷�
        // $('body').on("drop",".row",function(e){
        // $(".dragger").on('drop',function(e){
        $("body").on('drop', function(e) {
            e.preventDefault(); //鍙栨秷榛樿娴忚鍣ㄦ嫋鎷芥晥鏋�
            var fileList = e.originalEvent.dataTransfer.files; //鑾峰彇鏂囦欢瀵硅薄
            var img_file = [];
            for (var i = 0; i < fileList.length; i++) {
                var file = fileList[i];
                if (fileList[0].type.indexOf('image') !== -1 && fileList[0] != "undefined") {
                    img_file.push(file);
                }
            }
            Wbpd.prototype.getImageFile(img_file, fileList.length);
        });

        //HTML5 paste http://www.zhihu.com/question/20893119
        $("#res_img").on("paste", function(e) {
            var oe = e.originalEvent;
            var clipboardData, items, item;
            if (oe && (clipboardData = oe.clipboardData) && (items = clipboardData.items)) {
                var b = false;
                var img_file = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    if ((item = items[i]) && item.kind == 'file' && item.type.match(/^image\//i)) {
                        b = true;
                        img_file.push(item.getAsFile());
                    }
                }
                Wbpd.prototype.getImageFile(img_file, items.length);
                if (b) return false;
            }
        });

    },
    //涓婁紶瀹屾垚鎴栬€呭嚭閿欐椂鐨勫鐞�
    uploadFinishEvent: function() {
        $('#uploadPlaceHolder').prop('src', '1x1.png');
        $('.clicker').css('border', 'none').css('background-color', 'transparent').css('box-shadow','none');
    },
    //妫€鏌ュ井鍗氱櫥褰曠姸鎬�
    checkWeiboStatus: function() {
        $("body").addClass("app-loading");
        $.ajax({
            url: "http://weibo.com/aj/onoff/getstatus",
            cache: false,
            success: function(result){
                $("div.loading-bar").remove();
                if (result && result.code == '100000') {
                    $('#statusBadge').addClass('badge-success');
                } else {
                    $('#statusBadge').removeClass('badge-success');
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "鎻愮ず",
                        message: "寰崥璐︽埛鏈櫥褰�...",
                        requireInteraction: true,
                    });
                }
            },
            error : function(){
                $("div.loading-bar").remove();
            }
        });
    },
    //鍒囨崲鎵归噺妯″紡
    toggleBatch: function(flag) {
        if (arguments.length > 0 && !isNaN(flag)) {
            var batch = parseInt(flag) > 0 ? 1 : 0;
        } else {
            var batch = $(".btn-batch").data('batch') | 0;
            batch = batch > 0 ? 0 : 1;
        }
        if (batch == 1) {
            Wbpd.prototype.is_batch = batch;
            $(".btn-batch").text('杩斿洖榛樿');
            $(".btn-batch").data('batch', batch);
            $('.single-model').hide();
            $('.btn-batchcopy').parent().css('display', 'block');
            $('.btn-format').parent().css('display', 'inline-block');
            $('.batch-model').show();
        } else {
            Wbpd.prototype.is_batch = batch;
            $(".btn-batch").text('鎵归噺妯″紡');
            $(".btn-batch").data('batch', batch);
            $('.single-model').show();
            $('.btn-batchcopy').parent().css('display', 'none');
            $('.btn-format').parent().css('display', 'none');
            $('.batch-model').hide();
        }
    },
    //pid璁＄畻url
    pid2url: function(params, type) {
        function crc32(str) {
            str = String(str);
            var table = '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D';
            if (typeof(crc) == 'undefined') {
                crc = 0;
            }
            var x = 0,
                y = 0;
            crc = crc ^ (-1);
            for (var i = 0, iTop = str.length; i < iTop; i++) {
                y = (crc ^ str.charCodeAt(i)) & 0xFF;
                x = '0x' + table.substr(y * 9, 8);
                crc = (crc >>> 8) ^ x;
            }
            return crc ^ (-1);
        }

        var url, zone, ext;
        var url_pre = $("#https").is(':checked') ? https_pre : http_pre;
        if (typeof(type) == 'undefined') type = 'bmiddle';
        if (params.pid[9] == 'w') {
            zone = (crc32(params.pid) & 3) + 1;
            url = url_pre + zone + '.sinaimg.cn/' + type + '/' + params.pid;
        } else {
            zone = ((params.pid.substr(-2, 2), 16) & 0xf) + 1;
            url = url_pre + zone + '.sinaimg.cn/' + type + '/' + params.pid;
        }
        return url + params.ext;
    },
    changePicFormat: function(params, i) {
        var picSizeType = $(".btn-group").children(".active").prop("value"); //鑾峰彇鍥剧墖澶у皬
        var callBackImg = Wbpd.prototype.pid2url(params, picSizeType);
        if (Wbpd.prototype.is_batch > 0 && arguments.length > 1) { //鎵归噺妯″紡
            $('#res' + i).data('url', callBackImg); //鎵归噺妯″紡,鏁版嵁瀛樺埌涓嬮潰鐨勫湴鍧€妗嗕腑
            var url_format = parseInt($(".btn-format").parent().children(".active").prop("value"));
            switch (url_format) {
                case 1:
                    $('#res' + i).val(callBackImg); //鍘熷閾炬帴
                    break;
                case 2:
                    $('#res' + i).val('<img src="' + callBackImg + '"/>'); //img
                    break;
                case 3:
                    $('#res' + i).val('[IMG]' + callBackImg + '[/IMG]'); //ubb
                    break;
                case 4:
                    $('#res' + i).val('!['+params.pic_name+'](' + callBackImg + ')'); //markdown
                    break;
                default:
                    $('#res' + i).val(callBackImg);
                    break;
            }
        } else { //鍗曞浘妯″紡
            $('#res_img').data('url', callBackImg); //鍗曞浘妯″紡,鏁版嵁瀛樺埌绗竴涓緭鍏ユ
            $('#res_img').val(callBackImg);
            $('#res_html').val('<img src="' + callBackImg + '"/>');
            $('#res_ubb').val('[IMG]' + callBackImg + '[/IMG]');
            $('#res_md').val('!['+params.pic_name+'](' + callBackImg + ')');
        }
        return callBackImg;
    },
    saveUrlToLocal: function(params, image, i) {
        if (Wbpd.prototype.is_batch > 0 && arguments.length > 1) { //鎵归噺妯″紡
            $('#res' + i).data('params', params);
            $('#res' + i).data('url', image);
        } else {
            $('#res_img').data('params', params);
            $('#res_img').data('url', image);
            $(".loader-wrap").fadeOut("fast");
            $(".btn-copy").removeClass("disabled");
        }

        //store upload image to localStorage
        storageData.push({
            date: (new Date()).getTime(),
            imgsrc: image
        });
        localStorage.weiboData = JSON.stringify(storageData);
    },
    //鎵归噺涓婁紶鍥剧墖鏃�,缁樺埗缁撴灉鍖�
    batchDisplay: function(n) {
        var str = '';
        for (var i = 0; i < n; i++) {
            str = str + '\
                        <div class="col-xs-4 col-md-4 col-lg-4">\
                            <div class="fancybox-close"></div>\
                            <img src="placeholder2.png" class="clicker dragger batch-img" id="pic' + i + '">\
                            <div class="progress">\
                                <div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%">\
                                    <span class="sr-only">20% Complete</span>\
                                </div>\
                            </div>\
                            <div class="input-append" style="display: none">\
                                <span id="span' + i + '">\
                                <input class="res col-xs-12 batch-url" id="res' + i + '" value="" spellcheck="false" readonly="true"/>\
                                </span>\
                            </div>\
                        </div>';
        }
        $('.batch-model').html(str);
    },
    //涓婁紶涓�,绂佺敤杩斿洖榛樿,瀹屾垚鍚庡惎鐢�
    toggleBtn: function(flag) {
        if (arguments.length > 0 && !isNaN(flag)) {
            var btn = parseInt(flag) > 0 ? 1 : 0;
        } else {
            var btn = $('.btn-batch').attr('disabled') != 'disabled' ? 0 : 1;
        }
        if (btn === 0) {
            $('.btn-batch').attr('disabled', 'disabled');
            $('.btn-batchcopy').attr('disabled', 'disabled');
        } else {
            $('.btn-batch').removeAttr('disabled');
            $('.btn-batchcopy').removeAttr('disabled', 'disabled');

        }

    },
    getImageFile: function(img_file, flag) {

        if (img_file.length > 0 && ($('.clicker:first').attr('src') != 'placeholder.png' || $('.clicker:last').attr('src') != 'placeholder2.png')) {
            Wbpd.prototype.clearData();
        }
        if (img_file.length > 1 || (img_file.length > 0 && Wbpd.prototype.is_batch > 0)) { //濡傛灉閫夋嫨澶氫釜鏂囦欢,鑷姩鍒囨崲鍒版壒閲忔ā寮�
            Wbpd.prototype.toggleBatch(1);
            Wbpd.prototype.toggleBtn(0); //鎸夐挳鍒囨崲
            Wbpd.prototype.batchDisplay(img_file.length);
        }
        for (var i = 0; i < img_file.length; i++) {
            var file = img_file[i];
            Wbpd.prototype.previewAndUpload(file, i);
        }
        //妫€娴嬫枃浠舵槸涓嶆槸鍥剧墖
        if (img_file.length < 1 && flag) {
            swal("鎮ㄦ嫋鐨勪笉鏄浘鐗噡");
            return false;
        }
    },
    //棰勮鍜屼笂浼�
    previewAndUpload: function(file, i) {
        Wbpd.prototype.uploadFinishEvent();
        $(".loader-wrap").show();
        var reader = new FileReader();
        var imgFile;
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            if (Wbpd.prototype.is_batch != 1) {
                $('.single-model img').prop('src', '1x1.png');
                $('.single-model img').css('background-image', 'url(' + this.result + ')');
                $('.single-model img').css('background-position', 'center');
                $('.file-info').css('display', 'inline-block');
                if (file.name.length > 30) {
                    $("#fileName").text(file.name.substring(0, 8) + "..." + file.name.substring(file.name.length - 8, file.name.length));
                } else {
                    $("#fileName").text(file.name);
                }
                $("#fileSize").text((e.total / 1024).toFixed(2) + " kb");
            } else {
                $('#pic' + i).prop('src', '1x1.png');
                $('#pic' + i).css('background-image', 'url(' + this.result + ')');
                $('#pic' + i).css('background-position', 'center');
            }
        };
        reader.onloadend = function(e) {
            $(".loader-wrap").fadeOut("fast");
            imgFile = e.target;
            var acceptType = imgFile.result.split(';')[0].toLowerCase();
            var base64 = imgFile.result.split(',')[1];
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", function() { Wbpd.prototype.updateProgress(event, i) });
            Wbpd.prototype.xhr_arr.push(xhr); //淇濆瓨xhr瀵硅薄
            Wbpd.prototype.pic_num++; //璁℃暟
            var data = new FormData();
            data.append('b64_data', base64);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var resText = xhr.responseText;
                        var splitIndex, rs, pid, params;
                        try {
                            splitIndex = resText.indexOf('{"');
                            rs = JSON.parse(resText.substring(splitIndex));
                            pid = rs.data.pics.pic_1.pid;
                            ret = rs.data.pics.pic_1.ret;
                            if(ret == 1){
                                //鑾峰彇鎴愬姛
                                global_pid = pid;
                                params = {
                                    pid: pid,
                                    ext: acceptType == 'data:image/gif' ? '.gif' : '.jpg',
                                    pic_name: file.name
                                };
                                image_url = Wbpd.prototype.changePicFormat(params, i);
                                Wbpd.prototype.saveUrlToLocal(params, image_url, i);
                                if (--Wbpd.prototype.pic_num == 0) { //濡傛灉鍥剧墖鏁伴€掑噺鑷�0,璇存槑鎵€鏈夊浘鐗囦笂浼犲畬鎴�
                                    Wbpd.prototype.toggleBtn(1);
                                }
                                $('#pic' + i).nextAll('.progress').hide();
                                $('#pic' + i).nextAll('.input-append').show();
                                return true;
                            }
                            if(ret == -1){
                                //鏈櫥闄�???
                                Wbpd.prototype.uploadFinishEvent();
                                chrome.notifications.create({
                                    type: "basic",
                                    iconUrl: "icon.png",
                                    title: "鎻愮ず",
                                    message: "寰崥璐︽埛鏈櫥褰�...",
                                    requireInteraction: false,
                                });
                                chrome.tabs.create({url : 'http://weibo.com/?topnav=1&mod=logo'});
                                setTimeout(
                                    function() {
                                        window.close();
                                    },
                                    3000);
                            } else if(ret == -11){
                                //鏍煎紡閿欒 姣斿ico 寰崥涓嶆敮鎸� png 鍙兘鐢╣if->
                                swal("鏍煎紡閿欒...");
                                return;
                            } else{
                                //鍏朵粬閿欒
                                swal("鍏朵粬閿欒...,閿欒缂栫爜涓�:"+ret + "璇疯仈绯讳綔鑰呰繘琛屾坊鍔�");
                                return;
                            }

                        } catch (e) {
                            return;
                        }
                    } else {
                        swal("鍥剧墖涓婁紶澶辫触...");
                    }
                }
            };
            xhr.open('POST', 'https://picupload.weibo.com/interface/pic_upload.php?ori=1&mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog');
            xhr.send(data);
        };
    },
    updateProgress: function(evt, i) {
        $('#single-progress').css('display', 'block');
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            // $('#pic0').nextAll('.progress').attr('width',percentComplete*100+"%");
            $('#pic' + i).nextAll('.progress').children('.progress-bar').css('width', percentComplete * 100 + "%");

            // hack 妫€娴嬫槸鍚︽槸鍗曞浘妯″紡
            if($('.single-model:visible')[0]) {
                $('#single-progress').children('.progress-bar').css('width', percentComplete * 100 + "%");
            }
        } else {
            //濡傛灉鏃犳硶璁＄畻灏辩粰涓亣鐨勮繘搴︽潯
            $('#pic' + i).nextAll('.progress').children('.progress-bar').css('width', "60%");

        }
    },
    //娓呯┖涔嬪墠鐨勪笂浼犳暟鎹�
    clearData: function() {
        //娓呯┖鍥剧墖鐨剆tyle
        $('.clicker').removeAttr('style');
        Wbpd.prototype.xhr_arr = []; //娓呯┖xhr鐨勫€�
        global_pid = '';

        //娓呯┖鎵归噺妯″紡涓殑鏁版嵁
        $('.batch-model').html('<div><img src="placeholder2.png" class="dragger clicker"></div>');

        //娓呯┖鍗曞浘妯″紡涓嬬殑鏁版嵁
        $('.single-model[class^=col-xs-4] img').prop('src', 'placeholder.png');
        $('.single-model[class^=col-xs-4] img').attr('data-url', 0);

        //娓呯┖鎵€鏈夌殑杈撳叆妗嗙殑鍐呭,鍖呮嫭鎵归噺妯″紡鍜屽崟鍥炬ā寮�
        $('.res').each(function() {
            $(this).val('');
            if ($(this).data('url') != undefined) { //濡傛灉褰撳墠杈撳叆妗嗚褰曚簡url,灏辨竻绌�
                $(this).data('url', '');
            }
        });
        //灏嗗崟鍥炬ā寮忎腑"澶嶅埗"鎸夐挳璁剧疆涓篸isabled
        $('.btn-copy').each(function() {
            $(this).addClass('disabled');
        });
    },
    imageToBase64: function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result, xhr.response);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        //鍥剧墖璇锋眰涓婁紶浜嬩欢
        case 'uploadImageDataByURL':
            var imageURL = request.url;
            if (imageURL) {
                Wbpd.prototype.imageToBase64(imageURL, (base64, data) => {
                    Wbpd.prototype.getImageFile([data], 1);
                });
            }
            break;
    }
});

$(function() {
    my = Wbpd.prototype;
    my.init();
    my.checkWeiboStatus();
});
