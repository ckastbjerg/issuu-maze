(function($) {
    var UNIT = 400;
    var quality = '_thumb_large';
    var onAnimationEnd = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';
    var onTransitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var magz = [];

    var map;

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
        } else if (type === 'emptyroom') {
            map = getMapArray(6, 6);
        } else if (type === 'designed') {
            map = [
                [1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 0, 0, 0, 1, 1, 1],
                [1, 1, 1, 1, 0, 1, 1, 1],
                [1, 1, 0, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
            ];
        } else {
            map = getMapArray(6, 6);

            for (var i = map.length - 1; i >= 0; i--) {
                for (var j = 0; j < map[i].length; j++) {
                    var random = Math.floor(Math.random() * 5);
                    if (random === 0) {
                        map[i][j] = 0;
                    }
                }
            }
        }
    }

    // translate is the horizontal position
    // translateZ is the depth/vertical position
    // rotateY is the flip/rotation amount
    var numMagz;
    var constructMap = function() {
        numMagz = 0;
        var rows = map.length - 1;

        for (var i = 0; i < map.length; i++) {
            var cells = map.length - 1;
            var mid = Math.floor(cells / 2);

            var currRow = map[i],
                prevRow = map[i - 1],
                nextRow = map[i + 1];

            for (var j = 0; j < map[i].length; j++) {
                var mag = null,
                    self = currRow[j],
                    leftNeighbor = currRow[j - 1],
                    rightNeighbor = currRow[j + 1],
                    topNeighbor = prevRow ? prevRow[j] : undefined,
                    bottomNeighbor = nextRow ? nextRow[j] : undefined;

                if (!topNeighbor) {
                    mag = getMag();
                    mag.used = true;
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT - UNIT;
                    mag.rotateY = 0;
                    numMagz++;
                }
                if (!bottomNeighbor) {
                    mag = getMag();
                    mag.used = true;
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT;
                    mag.rotateY = 180;
                    numMagz++;
                }
                if (!leftNeighbor) {
                    mag = getMag();
                    mag.used = true;
                    mag.translate = j * UNIT - UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = 90;
                    numMagz++;
                }
                if (!rightNeighbor) {
                    mag = getMag();
                    mag.used = true;
                    mag.translate = j * UNIT + UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = -90;
                    numMagz++;
                }
            }
        }
    };

    var getMag = function() {
        var mag = magz[numMagz];

        if (mag !== undefined) {
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
            console.log(magz[i].used);
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
                tempTranslateZ = ' translateZ(' + (doc.translateZ + 10000) + 'px)';
                break;
        }

        var $link = $('<a class="maze__wall js-document-cover" data-docId="' + doc.id + '" class="side-' + doc.id + '" href="' + doc.link + '"></a>');
        $link.css('transform', tempTranslate + tempTranslateZ + rotateY + scale);

        var $img = $('<img src="' + doc.imageSrc + '" />');

        setTimeout(function() {
            $link.addClass('js-show').css({
                'transform': translate + translateZ + rotateY + scale
            });
        }, 1 + (Math.random() * 1000));

        $img.appendTo($link);
        $link.appendTo($('.js-maze'));
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
                z += 400;
            } else if (dir === 2) {
                x -= 400;
            } else if (dir === 3) {
                z -= 400;
            } else if (dir === 4) {
                x += 400;
            }
        } else if (keyCode === 40) { // down
            if (dir === 1) {
                z -= 400;
            } else if (dir === 2) {
                x += 400;
            } else if (dir === 3) {
                z += 400;
            } else if (dir === 4) {
                x -= 400;
            }
        }
    }

    function setXOffsetAdjustment(dir) {
        switch (dir) {
            case 2:
                xOffsetAdjustment = -800;
                break;
            case 4:
                xOffsetAdjustment = 800;
                break;
            default:
                xOffsetAdjustment = 0;
        }
    }

    function setZOffsetAdjustment(dir) {
        switch (dir) {
            case 1:
                zOffsetAdjustment = 200;
                break;
            case 2:
                zOffsetAdjustment = -600;
                break;
            case 3:
                zOffsetAdjustment = -1400;
                break;
            case 4:
                zOffsetAdjustment = -600;
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
            setRotation(e.keyCode);
            setDirection(e.keyCode);
            move(e.keyCode, dir);
            setXOffsetAdjustment(dir);
            setZOffsetAdjustment(dir);

            var tempX = x + xOffsetAdjustment;
            var tempZ = z + zOffsetAdjustment;

            var debug = '<div class="debugger js-debugger">' +
                '<span>dir: ' + dir + '</span>' +
                '<span>z: ' + z + '</span>' +
                '<span>x: ' + x + '</span>' +
                '<span>rotation: ' + rotation + '</span>' +
                '<span>dirOffset: ' + dirOffset + '</span>' +
                '</div>';

            $('.js-debugger').remove();
            $('body').append(debug);

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

        var $img = $(this).find('img:last-child'),
            nextImgSrc = getNextImageSrc($img);

        $newImg = $('<img src="' + nextImgSrc + '">');
        $(this).append($newImg);

        $newImg.on('load', function() {

            $newImg.addClass('js-animate-in');
            $newImg.one(onAnimationEnd, function(e) {
                preloadImage($newImg);
                $newImg.removeClass('js-animate-in');
                $newImg.addClass('js-current-page');
                $img.remove();
            });
        });
    });

    function letsDoIt(docs, isInterests) {
        $('.js-maze-wrapper').removeClass('js-opague');
        $('.js-maze').empty();

        generateMap();

        if (isInterests) {
            constructInterestsDocs(docs);
        } else {
            constructDocs(docs);
        }

        constructMap();
        constructFloor();
        appendMap();

        $('.js-interests').addClass('js-hide');
    }

    $('.js-search-btn').on('click', function(e) {
        e.preventDefault();

        var title = $('.js-search-text').val();
        getDocs('title:' + title + '&sortBy=views&language=en').then(function(docs) {
            letsDoIt(docs);
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
                letsDoIt(data.rsp._content.stream, true);
            } else {
                new Error('the value of "data" is not truthy...');
            }
        });
    });

    // $('.js-search-text').val('games');
    // $('.js-search-btn').click();

})(jQuery);
