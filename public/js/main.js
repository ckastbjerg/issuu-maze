(function($) {
    var UNIT = 800;
    var quality = '';
    var onAnimationEnd = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';
    var onTransitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var magz = [];

    var map;

    var featureToggles = {
        magnifyingGlass: false,
        walkThroughWalls: false,
        debugger: false
    };

    $('.js-feature-toggle').on('change', function() {
        featureToggles[$(this).attr('data-ref')] = $(this).is(':checked') ? true : false;
    });

    $('.js-choose-layout').on('change', function() {
        if (magz.length > 0) {
            letsDoIt();
        }
    });

    var getDocs = function(query) {
        var d = $.Deferred();

        $.getJSON('/query?q=' + query + '&pageSize=50', function(data) {
            if (data) {
                d.resolve(data.response.docs);
            } else {
                d.reject(new Error('the value of "data" is not truthy...'));
            }
        });

        return d.promise();
    };

    var constructDocs = function(docs) {
        magz = [];
        for (var i in docs) {
            var doc = docs[i];

            doc.id = magz.length;
            doc.link = 'http://issuu.com/' + doc.username + '/docs/' + doc.docname;
            doc.imageSrc = 'http://image.issuu.com/' + doc.documentId + '/jpg/page_1' + quality + '.jpg';

            magz.push(doc);
        }
    };

    var constructInterestsDocs = function(docs) {
        magz = [];
        for (var i in docs) {
            var doc = docs[i].content;
            var id = doc.revisionId + '-' + doc.publicationId;

            doc.id = magz.length;
            doc.link = 'http://issuu.com/' + doc.ownerUsername + '/docs/' + doc.publicationName;
            doc.imageSrc = 'http://image.issuu.com/' + id + '/jpg/page_1' + quality + '.jpg';

            magz.push(doc);
        }
    };

    function getMapArray(width, height) {
        var arr = [];

        for (var i = 0; i < width; i++) {
            arr.push([]);

            for (var j = 0; j < height; j++) {
                arr[i].push(1);
            }
        }

        return arr;
    }

    function generateMap(type) {
        if (type === 'hallway') {
            map = getMapArray(20, 1);
        } else if (type === 'looper') {
            map = [
                [0, 1, 1, 1, 0],
                [1, 1, 0, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 0, 1, 1],
                [0, 1, 1, 1, 0],
            ];
        } else if (type === 'spiral') {
            map = [
                [1, 1, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 1, 1]
            ];
        } else if (type === 'multi') {
            map = [
                [1, 1, 1, 3, 1, 1, 1],
                [1, 1, 3, 3, 3, 1, 1],
                [1, 1, 1, 3, 3, 3, 3],
                [3, 3, 3, 3, 3, 3, 3],
                [3, 1, 3, 3, 1, 1, 1],
                [3, 1, 1, 3, 3, 2, 1],
                [3, 3, 3, 3, 1, 1, 1]
            ];
        } else if (type === 'random') {
            map = getMapArray(5, 5);

            for (var i = map.length - 1; i >= 0; i--) {
                for (var j = 0; j < map[i].length; j++) {
                    var random = Math.floor(Math.random() * 5);
                    if (random === 0) {
                        map[i][j] = 0;
                    }
                }
            }
        } else { // default to random array
            map = [
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
            ];
        }
    }

    function doCreateWall(blockType, neighbor) {
        var doCreateWall = false;

        if (blockType === 0 && neighbor !== undefined && (neighbor === 1 || neighbor === 2)) {
            doCreateWall = true;
        } else if (blockType === 1 && neighbor === undefined) {
            doCreateWall = true;
        }

        if (blockType !== 3 && neighbor === 3) {
            doCreateWall = true;
        }

        return doCreateWall;
    }

    // translate is the horizontal position
    // translateZ is the depth/vertical position
    // rotateY is the flip/rotation amount
    var numMagz;
    var constructMap = function() {
        numMagz = 0;
        var rows = map.length - 1;

        map.forEach(function(row, i) {
            var cells = map.length - 1,
                prevRow = map[i - 1],
                nextRow = map[i + 1];

            row.forEach(function(blockType, j) {
                var mag = null,
                    leftNeighbor = row[j - 1],
                    rightNeighbor = row[j + 1],
                    topNeighbor = prevRow ? prevRow[j] : undefined,
                    bottomNeighbor = nextRow ? nextRow[j] : undefined;

                if (doCreateWall(blockType, topNeighbor)) {
                    mag = getMag();
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT - UNIT;
                    mag.rotateY = 0;

                    if (blockType === 0) {
                        mag.rotateY = 180;
                    }
                }
                if (doCreateWall(blockType, bottomNeighbor)) {
                    mag = getMag();
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT;
                    mag.rotateY = 180;

                    if (blockType === 0) {
                        mag.rotateY = 0;
                    }
                }
                if (doCreateWall(blockType, leftNeighbor)) {
                    mag = getMag();
                    mag.translate = j * UNIT - UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = 90;

                    if (blockType === 0) {
                        mag.rotateY = -90;
                    }
                }
                if (doCreateWall(blockType, rightNeighbor)) {
                    mag = getMag();
                    mag.translate = j * UNIT + UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = -90;

                    if (blockType === 0) {
                        mag.rotateY = 90;
                    }
                }
            });
        });
    };

    var getMag = function() {
        var mag = magz[numMagz];

        if (mag !== undefined) {
            mag.used = true;
            numMagz += 1;
            return mag;
        }

        magz.push({
            id: magz.length,
            imageSrc: 'http://dummyimage.com/1x1/bfbdbf/fff',
            link: '#'
        });

        return magz[numMagz];
    };

    var appendMap = function() {
        for (var i = magz.length - 1; i >= 0; i--) {
            if (magz[i].used) {
                appendDocument(magz[i]);
            }
        }
    };

    var constructFloor = function() {
        var $floor = $('<div class="maze__floor js-maze-floor">').css({
            height: map.length * UNIT,
            width: map[0].length * UNIT
        });
        $floor.appendTo($('.js-maze'));
    };

    var appendDocument = function(doc) {
        var translate = doc.translate ? ' translate(' + doc.translate + 'px, 0)' : '',
            translateZ = doc.translateZ ? ' translateZ(' + doc.translateZ + 'px)' : '',
            rotateY = doc.rotateY ? ' rotateY(' + doc.rotateY + 'deg)' : '',
            scale = 'scale(1)';

        var tempTranslate = translate,
            tempTranslateZ = translateZ;
        switch (doc.rotateY) {
            case 0:
                tempTranslateZ = ' translateZ(' + (doc.translateZ - 100) + 'px)';
                break;
            case -90:
                tempTranslate = ' translate(' + (doc.translate + 100) + 'px, 0)';
                break;
            case 90:
                tempTranslate = ' translate(' + (doc.translate - 100) + 'px, 0)';
                break;
            case 180:
                tempTranslateZ = ' translateZ(' + (doc.translateZ + 100) + 'px)';
                break;
        }

        var $wall = $('<a class="maze__wall js-document-cover" data-docId="' + doc.id + '" href="' + doc.link + '"></a>');
        var $wallInner = $('<div class="maze__wall-inner js-wall-inner"></div>');
        $wall.css('transform', tempTranslate + tempTranslateZ + rotateY + scale);

        var $img = $('<img class="maze__wall-image" src="' + doc.imageSrc + '" />');
        $img.on('load', function() {
            $(this).addClass('js-loaded');
        });

        setTimeout(function() {
            $wall.addClass('js-show').css({
                'transform': translate + translateZ + rotateY + scale
            });

        }, 1 + (Math.random() * 1000));

        $img.appendTo($wallInner);
        $wallInner.appendTo($wall);
        $wall.appendTo($('.js-maze'));
    };

    $(".js-maze").on("mouseenter", "a", function(e) {
        var mag = magz[$(this).attr('data-magId')];
    });

    // Trigger a bird view
    $('.js-top-view-btn').on('click', function() {
        var center = (map.length * UNIT) / 2;
        var z = center - UNIT;
        var x = center - UNIT / 2;
        $('.js-maze').css('transform', 'rotateX(' + -90 + 'deg) translate3d(' + -x + 'px, ' + center * 3 + 'px, ' + -z + 'px)');
    });


    var z = 0,
        x = 0,
        rotation = 0;

    var dir = 1;

    var xOffsetAdjustment = 0;
    var zOffsetAdjustment = 0;

    var dirOffset = 0;

    function setRotation(keyCode) {
        switch (keyCode) {
            case 39:
                rotation += 90;
                break;
            case 37:
                rotation -= 90;
                break;
        }
    }

    function setDirection(keyCode) {
        switch (keyCode) {
            case 39:
                dir += 1;
                break;
            case 37:
                dir -= 1;
                break;
        }

        if (dir > 4) {
            dir = 1;
        } else if (dir < 1) {
            dir = 4;
        }
    }

    function move(keyCode, dir) {
        if (keyCode === 38) { // up
            if (dir === 1) {
                z += UNIT;
            } else if (dir === 2) {
                x -= UNIT;
            } else if (dir === 3) {
                z -= UNIT;
            } else if (dir === 4) {
                x += UNIT;
            }
        } else if (keyCode === 40) { // down
            if (dir === 1) {
                z -= UNIT;
            } else if (dir === 2) {
                x += UNIT;
            } else if (dir === 3) {
                z += UNIT;
            } else if (dir === 4) {
                x -= UNIT;
            }
        }
    }

    function setXOffsetAdjustment(dir) {
        switch (dir) {
            case 2:
                xOffsetAdjustment = -400 * 2;
                break;
            case 4:
                xOffsetAdjustment = 400 * 2;
                break;
            default:
                xOffsetAdjustment = 0;
        }
    }

    function setZOffsetAdjustment(dir) {
        switch (dir) {
            case 1:
                zOffsetAdjustment = 400;
                break;
            case 2:
                zOffsetAdjustment = -400;
                break;
            case 3:
                zOffsetAdjustment = -1200;
                break;
            case 4:
                zOffsetAdjustment = -400;
                break;
        }
    }

    function preloadImage($Img) {
        var src = getNextImageSrc($Img);
        (new Image()).src = src;
    }

    function getNextImageSrc($img) {
        var imgSrc = $img.attr('src'),
            currentPageNum = imgSrc.split('page_')[1].split('.')[0],
            nextPageNum = parseInt(currentPageNum) + 1,
            nextImgSrc = imgSrc.replace('page_' + currentPageNum, 'page_' + nextPageNum + quality);

        return nextImgSrc;
    }

    function readFadeIn($doc) {
        $('.js-reading').removeClass('js-reading');
        $doc.addClass('js-reading');
        $('.js-maze').addClass('js-fade');
    }

    function readFadeOut() {
        $('.js-reading').removeClass('js-reading');
        $('.js-maze').removeClass('js-fade');
    }

    $('body').on('keydown', function(e) {
        switch (e.keyCode) {
            case 83: // s
                $('.js-search-nav-btn').click();
                break;
            case 84: // t
                $('.js-top-view-btn').click();
                break;
            case 76: // t
                $('body').toggleClass('js-god-mode');
                $('img').each(function() {
                    var src = $(this).attr('src');
                    var newSrc = src.replace('thumb_large', 'thumb_small');
                    $(this).attr('src', newSrc);
                });
                break;
        }

        if ($('.js-interests').hasClass('js-hide')) {
            setDirection(e.keyCode);
            move(e.keyCode, dir);
            setXOffsetAdjustment(dir);
            setZOffsetAdjustment(dir);
            setRotation(e.keyCode);

            var tempX = x + xOffsetAdjustment;
            var tempZ = z + zOffsetAdjustment;

            $('.js-debugger').remove();

            if (featureToggles.debugger) {
                var debug = '<div class="debugger js-debugger">' +
                    '<span>dir: ' + dir + '</span>' +
                    '<span>z: ' + z + '</span>' +
                    '<span>x: ' + x + '</span>' +
                    '<span>rotation: ' + rotation + '</span>' +
                    '<span>dirOffset: ' + dirOffset + '</span>' +
                    '<span>xOffsetAdjustment: ' + xOffsetAdjustment + '</span>' +
                    '<span>zOffsetAdjustment: ' + zOffsetAdjustment + '</span>' +
                    '</div>';

                $('body').append(debug);
            }

            readFadeOut();

            $('.js-maze').css('transform', 'rotateY(' + rotation + 'deg) translate3d(' + tempX + 'px, 0, ' + tempZ + 'px)');

        }
    });

    $('body').on('mouseenter', '.js-document-cover', function(e) {
        preloadImage($(this).find('img:last-child'));
    });

    $('body').on('click', '.js-document-cover', function(e) {
        e.preventDefault();

        readFadeIn($(this));

        var $wallInner = $(this).find('.js-wall-inner'),
            $img = $wallInner.find('img:last-child'),
            nextImgSrc = getNextImageSrc($img);

        $newImg = $('<img class="maze__wall-image" src="' + nextImgSrc + '">');
        $wallInner.append($newImg);

        $newImg.on('load', function() {
            $newImg.addClass('js-loaded');
            $newImg.addClass('js-animate-in');
            $newImg.one(onAnimationEnd, function(e) {
                preloadImage($newImg);
                $newImg.removeClass('js-animate-in');
                $newImg.addClass('js-current-page');
                $img.remove();
            });
        });
    });

    $('.js-search-btn').on('click', function(e) {
        e.preventDefault();

        var title = $('.js-search-text').val();
        getDocs('title:' + title + '&sortBy=views&language=en').then(function(docs) {
            constructDocs(docs);
            letsDoIt();
        });
    });

    $('select').on('change', function() {
        console.log(this.value);
    });

    $('.js-search-nav-btn').on('click', function(e) {
        $('.js-interests.js-hide').removeClass('js-hide');
        $('.js-maze-wrapper').addClass('js-opague');
        $('.js-maze-wrapper').one(onTransitionEnd, function(e) {
            $('.js-search-text').focus();
        });
    });

    $('.js-search-text').keyup(function(e) {
        if (e.keyCode == 13) {
            $(".js-search-btn").click();
        }
    });

    function constructInterestsDropdown(interests) {
        for (var i = 0; i < interests.length; i++) {
            $('.js-interests-inner').append('<a class="interest interest--main js-interest" data-id="' + interests[i].interestId + '">' + interests[i].title + '</a>');

            var sub = interests[i].subinterests;
            for (var j = 0; j < sub.length; j++) {
                $('.js-interests-inner').append('<a class="interest interest--sub js-interest" data-id="' + sub[j].subinterestId + '">' + sub[j].title + '</a>');
            }
        }
    }

    $.getJSON('/interests', function(data) {
        if (data) {
            constructInterestsDropdown(data.interests);
        } else {
            new Error('the value of "data" is not truthy...');
        }
    });

    $('body').on('click', '.js-interest', function(e) {
        e.preventDefault();
        $.getJSON('/iosinterest?q=' + $(this).attr('data-id'), function(data) {
            if (data) {
                constructInterestsDocs(data.rsp._content.stream);
                letsDoIt();
            } else {
                new Error('the value of "data" is not truthy...');
            }
        });
    });

    // $('.js-search-text').val('games');
    // $('.js-search-btn').click();

    var native_width = 0;
    var native_height = 0;

    //Now the mousemove function
    $('body').on('mousemove', '.js-magnify', function(e) {
        if (featureToggles.magnifyingGlass) {
            if (!native_width && !native_height) {
                var image_object = new Image();
                image_object.src = $(".js-magnify-image").attr("src");
                native_width = image_object.width;
                native_height = image_object.height;
            } else {
                var magnify_offset = $(this).offset();
                var mx = e.pageX - magnify_offset.left;
                var my = e.pageY - magnify_offset.top;

                if (mx < $(this)[0].getBoundingClientRect().width && my < $(this)[0].getBoundingClientRect().height && mx > 0 && my > 0) {
                    $(".js-magnify-glass").fadeIn(100);
                } else {
                    $(".js-magnify-glass").fadeOut(100);
                }
                if ($(".js-magnify-glass").is(":visible")) {
                    var rx = Math.round(mx / $(".js-magnify-image")[0].getBoundingClientRect().width * native_width - $(".js-magnify-glass")[0].getBoundingClientRect().width / 2) * -1;
                    var ry = Math.round(my / $(".js-magnify-image")[0].getBoundingClientRect().height * native_height - $(".js-magnify-glass")[0].getBoundingClientRect().height / 2) * -1;
                    var bgp = rx + "px " + ry + "px";

                    var px = mx - $(".js-magnify-glass")[0].getBoundingClientRect().width / 2;
                    var py = my - $(".js-magnify-glass")[0].getBoundingClientRect().height / 2;

                    $(".js-magnify-glass").css({
                        left: px,
                        top: py,
                        backgroundPosition: bgp
                    });
                }
            }
        }
    });

    $('body').on('mouseenter', '.js-wall-inner', function(e) {
        if (featureToggles.magnifyingGlass) {
            var $magnify = $('<div class="magnify js-magnify"></div>');
            var $magnifyGlass = $('<div class="magnify__glass js-magnify-glass"><div>');
            var $magnifyImage = $(this).find('img:last-child').addClass('magnify__image js-magnify-image');

            $magnify.width($magnifyImage.width());
            $magnifyImage.width($magnifyImage.width());
            $magnifyGlass.css({
                background: 'url(' + $magnifyImage.attr('src') + ') no-repeat'
            });

            $magnifyGlass.appendTo($magnify);
            $magnifyImage.appendTo($magnify);
            $magnify.appendTo($(this));
        }
    });


    $('body').on('mouseleave', '.js-wall-inner', function(e) {
        if (featureToggles.magnifyingGlass) {
            $(this).find('.js-magnify-image').removeClass('magnify__image js-magnify-image').appendTo($(this));
            $(this).find('.js-magnify').remove();
        }
    });


    function letsDoIt() {
        $('.js-maze-wrapper').removeClass('js-opague');
        $('.js-maze').empty();

        console.log($('.js-choose-layout').val());
        generateMap($('.js-choose-layout').val());
        constructMap();
        // constructFloor();
        appendMap();

        $('.js-interests').addClass('js-hide');
    }

})(jQuery);
