// рекурсивная загрузка файлов
function htmlImport__importFiles(baseUrl, ht, i, callback) {

    var len = ht.length;

        if (i < len) {

            $.ajax({
                type: "GET",
                dataType: "html",
                url: baseUrl + ht[i].url
            }).done(function(html) {

                ht[i].content = html;

                i++;
                htmlImport__importFiles(baseUrl, ht, i, callback);

            }).fail(function(e) {

                callback(null, e);
            });
        } else {
            var resObj = {};
            for (var n in ht) {
                resObj[ht[n].name] = ht[n].content;
                if (ht[n].incType) {
                    $("[data-import=\"" + ht[n].url + "\"]").html(ht[n].content);
                } // end if
            } // end for

            callback(resObj, null);
        } // end if

    } // end fun

// точка входа, 
function htmlImport(baseUrl, cb) {

$(document).ready(function() {
            var importArray = [];
            $("link[data-import]").each(function() {

                var imp = $(this).data("import");
                var name = $(this).data("name");

                if (typeof name === 'undefined') {
                    name = imp;
                } // end if

                importArray.push({
                    "name": name,
                    "url": imp,
                    "content": null,
                    "incType": false
                });
            });

            // вызывааем рекурсивную загрузку файлов
            htmlImport__importFiles(baseUrl, importArray, 0, function(data) {
                cb(data);
            });

        });


    } // end fun