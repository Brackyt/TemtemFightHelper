var temtemTypes = {
    NEUTRAL: 0,
	FIRE: 1,
	WATER: 2,
	NATURE: 3,
	ELECTRIC: 4,
	EARTH: 5,
	MENTAL: 6,
	WIND: 7,
	DIGITAL: 8,
	MELEE: 9,
	CRYSTAL: 10,
	TOXIC: 11
};

var damage_array = [[1, 1, 1, 1, 1, 1, 1/2, 1, 1, 1, 1, 1],
            [1, 1/2, 1/2, 2, 1, 1/2, 1, 1, 1, 1, 2, 1],
            [1, 2, 1/2, 1/2, 1, 2, 1, 1, 2, 1, 1, 1/2],
            [1, 1/2, 2, 1/2, 1, 2, 1, 1, 1, 1, 1, 1/2],
            [1, 1, 2, 1/2, 1/2, 1/2, 2, 2, 2, 1, 1/2, 1],
            [1, 2, 1/2, 1/2, 2, 1, 1, 1/2, 1, 1, 2, 1],
            [2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1/2, 1],
            [1, 1, 1, 1, 1/2, 2, 1, 1/2, 1, 1, 1, 2],
            [1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 1, 1],
            [1, 1, 1, 1, 1, 2, 1/2, 1, 1, 1/2, 2, 1],
            [1, 1/2, 1, 1, 2, 1/2, 2, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 1, 1/2, 1, 1, 1/2, 1, 1/2, 1/2]
        ]

function getTemtemJSON(url, callback) {
    $.getJSON(url, function(data) {
        callback(data);
    });
}

function getTemTypes(allTemtem, toCompare) {
    var types = []
    var retTypes = []
    allTemtem.forEach((item, i) => {
        if (item['name'].toLowerCase() === toCompare.toLowerCase()) {
            types = item['type'];
            return false;
        }
    });
    types.forEach((type, i) => {
        $.each(temtemTypes, function(key, value) {
            if (type.toLowerCase() === key.toLowerCase()) {
                retTypes.push([type, value]);
            }
        });
    });

    return retTypes;
}

function getTemImage(allTemtem, toCompare) {
    var image = "";
    allTemtem.forEach((item, i) => {
        if (item['name'].toLowerCase() === toCompare.toLowerCase()) {
            image = item['image'];
            return false;
        }
    });
    return image;
}

function sortByScore(a, b) {
    var aScore = a[0];
    var bScore = b[0];

    return ((aScore < bScore) ? -1 : ((aScore > bScore) ? 1 : 0));
}

function doCalculations(allTemtem, yourTemtem, enemyTemtem) {
    var final_scores = [];
    enemyTemtem.forEach((enemy_tem, i) => {
        var enemy_types = getTemTypes(allTemtem, enemy_tem);
        var scores = []
        yourTemtem.forEach((user_tem, i) => {
            var user_types = getTemTypes(allTemtem, user_tem);
            var weakness = 0;

            if (enemy_types.length == 1 && user_types.length == 1) {
                if (damage_array[enemy_types[0][1]][user_types[0][1]] >= 2)
                    weakness = damage_array[enemy_types[0][1]][user_types[0][1]];
                scores.push([damage_array[user_types[0][1]][enemy_types[0][1]], user_tem, user_types[0][0], weakness]);
            }
            else if (enemy_types.length == 2 && user_types.length == 1) {
                calc = damage_array[user_types[0][1]][enemy_types[0][1]] * damage_array[user_types[0][1]][enemy_types[1][1]];
                enemy_calc = damage_array[enemy_types[0][1]][user_types[0][1]] * damage_array[enemy_types[1][1]][user_types[0][1]];
                if (enemy_calc >= 2)
                    weakness = enemy_calc;
                scores.push([calc, user_tem, user_types[0][0], weakness]);
            }
            else if (enemy_types.length == 1 && user_types.length == 2) {
                calc1 = damage_array[user_types[0][1]][enemy_types[0][1]];
                calc2 = damage_array[user_types[1][1]][enemy_types[0][1]];
                enemy_calc = damage_array[enemy_types[0][1]][user_types[0][1]] * damage_array[enemy_types[0][1]][user_types[1][1]];
                if (enemy_calc >= 2)
                    weakness = enemy_calc;
                scores.push([calc1, user_tem, user_types[0][0], weakness]);
                scores.push([calc2, user_tem, user_types[1][0], weakness]);
            }
            else if (enemy_types.length == 2 && user_types.length == 2) {
                calc1 = damage_array[user_types[0][1]][enemy_types[0][1]] * damage_array[user_types[0][1]][enemy_types[1][1]];
                calc2 = damage_array[user_types[1][1]][enemy_types[0][1]] * damage_array[user_types[1][1]][enemy_types[1][1]];

                enemy_calc1 = damage_array[enemy_types[0][1]][user_types[0][1]] * damage_array[enemy_types[0][1]][user_types[1][1]];
                enemy_calc2 = damage_array[enemy_types[1][1]][user_types[0][1]] * damage_array[enemy_types[1][1]][user_types[1][1]];
                if (enemy_calc1 * enemy_calc2 >= 2)
                    weakness = enemy_calc1 * enemy_calc2;
                scores.push([calc1, user_tem, user_types[0][0], weakness]);
                scores.push([calc2, user_tem, user_types[1][0], weakness]);
            }
        });
        scores.sort(sortByScore).reverse();
        final_scores.push([enemy_tem, scores])
    });
    return (final_scores);
}

$(document).ready(function() {
    var currentEditTemtem = undefined;
    var allYourTemtem = [];
    var allEnemyTemtem = [];
    var modalOpened = false;

    getTemtemJSON('https://raw.githubusercontent.com/Brackyt/TemtemFightHelper/master/data/temtem.json', function (all_temtem) {
        var modal_list = $('#temtem-modal .dialog ul');
        modal_list.append('<li class="big-clip" data-search-on-list="list-item" data-name="none"><span class="temtem-name">None</span></li>');
        all_temtem.forEach((temtem, i) => {
            var li = $('<li class="big-clip" data-search-on-list="list-item" data-name="' + temtem['name'] + '"></li>');

            li.append('<div class="image-container"><img width="50px" height="50px" class="temtem-icon" src="' + temtem['image'] + '"></div>');
            li.append('<span class="temtem-name">' + temtem['name'] + '</span>');

            var div = $('<div class="temtem-types"></div>');
            temtem['type'].forEach((type, i) => {
                div.append('<span class="temtem-type ' + type.toLowerCase() + '">' + type + '</span>');
            });

            li.append(div);
            modal_list.append(li);
        });
        SearchOnList.init($('[data-behaviour=search-on-list]'));

        $('#temtem-modal').click(function(event) {
            if(event.target.id == "dialog" || $(event.target).closest('#dialog').length)
                return;
            $('#temtem-modal').toggleClass("active");
        });

        $('.temtem-entry').click(function() {
            id = $(this).parent().attr('id');
            currentEditTemtem = [id, $(this).index()];
            modalOpened = true;
            $('#temtem-modal').toggleClass("active");
        });

        $('#calculate a').click(function() {
            var yourTemtem = $('#your-temtem').children();
            var enemyTemtem = $('#enemy-temtem').children();
            allYourTemtem = [];
            allEnemyTemtem = [];

            yourTemtem.each(function() {
                var name = $(this).find(".temtem-name");
                if (name.length !== 0) {
                    name = name.text();
                    allYourTemtem.push(name);
                }
            });
            enemyTemtem.each(function() {
                var name = $(this).find(".temtem-name");
                if (name.length !== 0) {
                    name = name.text();
                    allEnemyTemtem.push(name);
                }
            });

            var scores = doCalculations(all_temtem, allYourTemtem, allEnemyTemtem);
            if (scores.length > 0) {
                var div = $("#results");

                var image = getTemImage(all_temtem, scores[0][0]);
                var image1 = '';
                var beatFirst = '<th>Best to beat <img width="30px" height="30px" src="' + image + '"> ' + scores[0][0] + '</th>';
                var beatSecond = '';

                if (scores.length > 1) {
                    image1 = getTemImage(all_temtem, scores[1][0]);
                    beatSecond = '<th>Best to beat <img width="30px" height="30px" src="' + image1 + '"> ' + scores[1][0] + '</th>';
                }

                var table = $('<table class="big-clip"><thead><tr>' + beatFirst + beatSecond + '</tr></thead></table>');
                var tbody = $('<tbody></tbody>');
                var nbOfTemtem = scores[0][1].length;
                for (var i = 0; i < nbOfTemtem; i++) {
                    var image = getTemImage(all_temtem, scores[0][1][i][1]);
                    var firstTem = '<td><img width="30px" height="30px" src="' + image + '"> ' + scores[0][1][i][1] + ' <img width="30px" height="30px" src="data/types/' + scores[0][1][i][2].toLowerCase() + '.png">: x' + scores[0][1][i][0] + '</td>';
                    var secondTem = '';
                    if (scores.length > 1) {
                        image = getTemImage(all_temtem, scores[1][1][i][1]);
                        secondTem = '<td><img width="30px" height="30px" src="' + image + '"> ' + scores[1][1][i][1] + ' <img width="30px" height="30px" src="data/types/' + scores[1][1][i][2].toLowerCase() + '.png">: x' + scores[1][1][i][0] + '</td>';
                    }
                    tbody.append('<tr>' + firstTem + secondTem + '</tr>');
                }
                div.children().remove();
                table.append(tbody);
                div.append(table);
            }
        });

        $("#temtem-modal").on('click', 'li', function() {
            $('#temtem-modal').toggleClass("active");
            if (currentEditTemtem != undefined) {
                var entry = $('#' + currentEditTemtem[0]).children().eq(currentEditTemtem[1]);
                var info = entry.find(".temtem-info");
                var name = $(this).data("name");
                if (name !== 'none') {
                    var types = $(this).find(".temtem-types").clone();
                    var img = $(this).find(".temtem-icon").clone();
                    entry.find("img").remove();
                    info.children().not(':first').remove();
                    entry.prepend(img);
                    info.append('<span class="temtem-name">' + name + '</span>');
                    info.append(types);
                    entry.addClass("active");
                } else {
                    entry.removeClass("active");
                    entry.find("img").attr("src", "data/placeholder.png");
                    info.children().not(':first').remove();
                }

                currentEditTemtem = undefined;
            }
        });
    });
});
