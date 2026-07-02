// Client-side router – replaces Flask/Jinja templating
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    //  Utility helpers
    /* ------------------------------------------------------------------ */

    /** Escape HTML to prevent XSS from user-controlled URL fragments       */
    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    /** Build the canonical "slug" for an award key (keeps underscores).   */
    function awardSlug(key) { return key; } // e.g. paint_defender stays paint_defender

    /** Human-readable award name from slug                                */
    function awardName(slug) {
        return DATA.clean_award_names[slug] || esc(slug);
    }

    /** URL for a player page (spaces → underscores for the hash)          */
    function playerLink(name) {
        return '#player/' + encodeURIComponent(name.replace(/ /g, '_'));
    }

    /** URL for a winners page                                             */
    function winnerLink(award, year) {
        return '#winners/' + awardSlug(award) + '/' + year;
    }

    /* ------------------------------------------------------------------ */
    //  Page renderers
    /* ------------------------------------------------------------------ */

    /** Home page (index)                                                 */
    function renderHome() {
        var years = Object.keys(DATA.years).sort().reverse();
        var html = '<div class="page">';
        html += '<p>Welcome to the unofficial website for ';
        html += '<i>The Thinkies</i>, the annual defensive awards from ';
        html += 'the <i>Thinking Basketball</i> podcast.</p>';

        html += '<i><p><a href="#top-winners">Top Thinkies Winners of All Time</a></p></i>';
        html += '<i><p><a href="#player-index">Player Index</a></p></i>';

        for (var yi = 0; yi < years.length; yi++) {
            var year = years[yi];
            html += '<h2>' + esc(year) + ' Awards</h2><ul>';
            var awards = DATA.years[year];
            for (var ai = 0; ai < awards.length; ai++) {
                var award = awards[ai];
                html += '<li><a href="' + winnerLink(award, year) + '">' + esc(awardName(award)) + '</a></li>';
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    }

    /** Winners page for one award in one year                            */
    function renderWinners(award, year) {
        if (!DATA.clean_award_names[award] || !DATA.winners[award] || !DATA.winners[award][year]) return null; // 404

        var data = DATA.winners[award][year];
        var cleanName = awardName(award);
        var html = '<div class="page">';
        html += '<a href="#">Home</a>';
        html += '<h1>' + esc(cleanName) + ' ' + esc(year) + '</h1>';
        html += '<a href="' + esc(data.link) + '" target="_blank"><p><i>Episode link</i></p></a>';
        html += '<p><i>' + esc(DATA.descriptions[award]) + '</i></p>';

        var places = ['first', 'second', 'third'];
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var player = data[place];
            if (!player) continue;
            html += '<p><span class="rankingtext">' + esc(place.charAt(0).toUpperCase() + place.slice(1)) + ':</span> ';
            html += '<span class="playernametext"><a href="' + playerLink(player.name) + '">' + esc(player.name) + '</a></span></p>';
            if (player.team) {
                html += '<p><i>' + esc(player.team) + '</i></p>';
            }
            if (player.headshot_url) {
                html += '<img src="' + esc(player.headshot_url) + '" class="playerheadshot"/>';
            }
        }

        html += '</div>';
        return html;
    }

    /** Top winners of all time                                           */
    function renderTopWinners() {
        var players = DATA.top_5;
        var html = '<div class="page">';
        html += '<a href="#">Home</a>';
        html += '<h1>Top Thinkies Winners of All Time</h1>';
        html += '<p><i>First place wins are worth 3 points, second place worth 2, third place worth 1</i></p>';

        var places = ['first', 'second', 'third', 'fourth', 'fifth'];
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var p = players[place];
            if (!p) continue;
            html += '<p><span class="rankingtext">' + esc(place.charAt(0).toUpperCase() + place.slice(1)) + ':</span> ';
            html += '<span class="playernametext"><a href="' + playerLink(p.name) + '">' + esc(p.name) + '</a> - ' + p.points + ' points</span></p>';
            if (p.headshot_url) {
                html += '<img src="' + esc(p.headshot_url) + '" class="playerheadshot"/>';
            }
        }

        html += '</div>';
        return html;
    }

    /** Individual player page                                            */
    function renderPlayer(slug) {
        var name = decodeURIComponent(slug).replace(/_/g, ' ');
        var player = DATA.players[name];
        if (!player) return null; // 404

        var points = player.first.length * 3 + player.second.length * 2 + player.third.length;
        var html = '<div class="page">';
        html += '<a href="#">Home</a>';
        html += '<h1>' + esc(name) + '</h1>';
        html += '<p><i>' + points + ' Thinkies Points</i></p>';
        if (player.headshot_url) {
            html += '<img src="' + esc(player.headshot_url) + '" class="playerheadshot" />';
        }

        var places = ['first', 'second', 'third'];
        for (var pi = 0; pi < places.length; pi++) {
            var place = places[pi];
            if (player[place].length === 0) continue;
            html += '<p class="rankingtext">' + esc(place.charAt(0).toUpperCase() + place.slice(1)) + ' place wins:</p><ul>';
            for (var ai = 0; ai < player[place].length; ai++) {
                var award = player[place][ai][0];
                var year = player[place][ai][1];
                html += '<li><a href="' + winnerLink(award, year) + '">' + esc(awardName(award)) + ' ' + esc(year) + '</a></li>';
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    }

    /** Player index (alphabetical listing)                               */
    function renderPlayerIndex() {
        var names = Object.keys(DATA.players).sort(function (a, b) {
            return a.localeCompare(b);
        });
        var html = '<div class="page">';
        html += '<a href="#">Home</a>';
        html += '<h1>Player Index</h1><ul>';
        for (var i = 0; i < names.length; i++) {
            html += '<li><a href="' + playerLink(names[i]) + '">' + esc(names[i]) + '</a></li>';
        }
        html += '</ul></div>';
        return html;
    }

    /** 404 page                                                          */
    function render404() {
        var html = '<div class="page">';
        html += '<h1>404: Page Not Found</h1>';
        html += '<p style="color:crimson"><i><b>If you were trying to find the winners for an award for a certain year, make sure the boys actually gave awards for that year!</b></i></p>';
        html += '</div>';
        return html;
    }

    /* ------------------------------------------------------------------ */
    //  Router
    /* ------------------------------------------------------------------ */

    function route() {
        var hash = location.hash.slice(1) || '';          // strip leading '#'
        var html = null;

        if (hash === '') {
            html = renderHome();
        } else if (hash === 'top-winners') {
            html = renderTopWinners();
        } else if (hash === 'player-index') {
            html = renderPlayerIndex();
        } else if (hash.indexOf('winners/') === 0) {
            var parts = hash.split('/');                   // ["winners", award, year]
            html = renderWinners(parts[1], parts[2]);
        } else if (hash.indexOf('player/') === 0) {
            html = renderPlayer(hash.substring(7));       // skip "player/"
        }

        document.querySelector('[data-content]').innerHTML = html || render404();
    }

    // Listen for hash changes & run on initial load
    window.addEventListener('hashchange', route);
    window.addEventListener('DOMContentLoaded', route);
})();
