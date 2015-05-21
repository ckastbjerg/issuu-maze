(function($) {
    var UNIT = 400;
    var quality = '_thumb_large';
    var onAnimationEnd = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';
    var onTransitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var magz = [];

    var map = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ];

    for (var i = map.length - 1; i >= 0; i--) {
        for (var j = 0; j < map[i].length; j++) {
            var random = Math.floor(Math.random() * 5);
            if (random === 0) {
                map[i][j] = 0;
            }
        }
    }

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

    // translate is the horizontal position
    // translateZ is the depth/vertical position
    // rotateY is the flip/rotation amount
    var constructMap = function() {
        var numMagz = 0,
            numTexts = 0;
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
                    mag = getMag(numMagz);
                    mag.used = true;
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT - UNIT;
                    numMagz++;
                }
                if (!bottomNeighbor) {
                    mag = getMag(numMagz);
                    mag.used = true;
                    mag.translate = j * UNIT;
                    mag.translateZ = i * UNIT;
                    numMagz++;
                }
                if (!leftNeighbor) {
                    mag = getMag(numMagz);
                    mag.used = true;
                    mag.translate = j * UNIT - UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = -90;
                    numMagz++;
                }
                if (!rightNeighbor) {
                    mag = getMag(numMagz);
                    mag.used = true;
                    mag.translate = j * UNIT + UNIT / 2;
                    mag.translateZ = i * UNIT - UNIT / 2;
                    mag.rotateY = -90;
                    numMagz++;
                }
            }
        }
    };

    var getMag = function(numMagz) {
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
            if (magz[i].used) {
                appendDocument(magz[i]);
            }
        }
    };

    var constructFloor = function() {
        var height = map.length;
        var width = map[0].length;

        $('.js-maze-floor').css({
            height: height * UNIT,
            width: width * UNIT
        });
    };

    var appendDocument = function(doc) {
        var translate = doc.translate ? ' translate(' + doc.translate + 'px, 0)' : '',
            translateZ = doc.translateZ ? ' translateZ(' + doc.translateZ + 'px)' : '',
            rotateY = doc.rotateY ? ' rotateY(' + doc.rotateY + 'deg)' : '',
            scale = 'scale(1)';

        var $link = $('<a class="maze__wall js-document-cover" data-docId="' + doc.id + '" class="side-' + doc.id + '" href="' + doc.link + '"></a>');
        $link.css('transform', translate + translateZ + rotateY + scale);

        var $img = $('<img src="' + doc.imageSrc + '" />');

        $img.appendTo($link);
        $link.appendTo($('.js-maze'));
    };

    $(".js-maze").on("mouseenter", "a", function(e) {
        var mag = magz[$(this).attr('data-magId')];
    });

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
            case 84: // s
                $('.js-top-view-btn').click();
                break;
        }

        if ($('.search').hasClass('js-hide')) {
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

    $('.js-search-btn').on('click', function(e) {
        e.preventDefault();

        var title = $('.js-search-text').val();

        $('.js-maze').empty();

        getDocs('title:' + title + '&sortBy=views&language=en').then(function(docs) {
            return docs;
        }).then(function(docs) {
            constructDocs(docs);
            constructMap();
            constructFloor();
            appendMap();
        });

        $('.search').addClass('js-hide');
    });

    $('.js-search-nav-btn').on('click', function(e) {
        $('.search.js-hide').removeClass('js-hide');
        $('.search').one(onTransitionEnd, function(e) {
            console.log('testsretsetet');
            $('.js-search-text').focus();
        });
    });

    $('.js-search-text').keyup(function(e) {
        if (e.keyCode == 13) {
            $(".js-search-btn").click();
        }
    });

    // $('.js-search-text').val('games');
    // $('.js-search-btn').click();

})(jQuery);
