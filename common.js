class TmRoute {
    name;
    detector;

    constructor(name, detector, params = {}) {
        this.name = name;
        this.detector = detector;

        for (const key in params) {
            this[key] = params[key];
        }
    }
}

TmDebug = (...args) => {
    console.info("TmDebug : ", ...args);
};

class TmFilter {
    token;
    profiles = {};
    filtersCookie = "tm-filters";
    autoNextCookie = "tm-auto-next";
    dateFilterCookie = "tm-date-filter";
    ageFilterCookie = "tm-age-filter";
    routes = [];

    constructor(token, params = {}) {
        this.token = token;

        const response = await fetch("https://games.felixgilles.fr/api/site", {
            cache: "no-cache",
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: "Bearer " + this.token,
            }
        });
        const json = await response.json();
        json.data.profiles.every(function (profile) {
            this.profiles[profile.id] = profile;
        });
        TmDebug("profiles", this.profiles);
    }

    getProfile(id) {
        if (!this.profiles.hasOwnProperty(id)) {
            return null;
        }
        const profile = this.profiles[id];
        if (profile.hide_until) {
            profile.hide_until = new Date(profile.hide_until);
        }
        if (profile.last_activity_at) {
            profile.last_activity_at = new Date(profile.last_activity_at);
        }

        return profile;
    }

    addRoute(route) {
        this.routes.push(route);
    }

    router() {
        TmDebug("router", document.location.href);
        this.routes.every(function (route) {
            const ok = route.detector();
            if (ok) {
                TmDebug("route", route.name, "for", document.location.href);
            }

            return !ok;
        });
    }

    getFiltersValue() {
        return GM_getValue(this.filtersCookie, "on") === "on";
    }
    setFiltersValue(value) {
        GM_setValue(this.filtersCookie, value);
    }

    getAutoNextValue() {
        return GM_getValue(this.autoNextCookie, "on") === "on";
    }
    setAutoNextValue(value) {
        GM_setValue(this.autoNextCookie, value);
    }

    getDateFilterValue() {
        return GM_getValue(this.dateFilterCookie, "6");
    }
    setDateFilterValue(value) {
        GM_setValue(this.dateFilterCookie, value);
    }

    getAgeFilterValue() {
        return GM_getValue(this.ageFilterCookie, "25");
    }
    setAgeFilterValue(value) {
        GM_setValue(this.ageFilterCookie, value);
    }

    profileButton(button, id) {
        let value = this.getIndicatorValue(id);
        button.innerHTML =
            value === this.indicatorHiddenTemp
                ? "Profil caché temporairement"
                : value === this.indicatorHiddenDefinitive
                  ? "Profil caché définitivement"
                  : "Profil affiché";
        if (!!value) {
            button.classList.remove("tm-active");
        } else {
            button.classList.add("tm-active");
        }
    }
    filterButton(button) {
        const value = this.getFiltersValue();
        button.innerHTML = value ? "Filtrés cachés" : "Filtrés affichés";
        if (value) {
            button.classList.add("tm-active");
        } else {
            button.classList.remove("tm-active");
        }
    }
    autoNextButton(button) {
        const value = this.getAutoNextValue();
        button.innerHTML = value ? "AutoNext activé" : "AutoNext désactivé";
        if (value) {
            button.classList.add("tm-active");
        } else {
            button.classList.remove("tm-active");
        }
    }
    filterDateMenu(summary, chooses) {
        const value = this.getDateFilterValue();
        summary.innerHTML = "Dernière activité : " + (value ? value + " mois" : "illimitée");
        chooses.forEach(function (choose) {
            const chooseValue = choose.getAttribute("data-value");
            if (value === chooseValue) {
                choose.classList.add("tm-active");
            } else {
                choose.classList.remove("tm-active");
            }
        });
    }

    filterAgeMenu(summary, chooses) {
        const value = this.getAgeFilterValue();
        summary.innerHTML = "Age : " + (value ? value + " ans" : "illimitée");
        chooses.forEach(function (choose) {
            const chooseValue = choose.getAttribute("data-value");
            if (value === chooseValue) {
                choose.classList.add("tm-active");
            } else {
                choose.classList.remove("tm-active");
            }
        });
    }

    filters(params) {
        const filterCallback = params.filterCallback ?? function () {};
        const filterDate = params.filterDate ?? false;
        const filterAge = params.filterAge ?? false;
        const autoNext = params.autoNext ?? false;
        const profile = params.profile ?? null;
        const container = document.createElement("div");
        container.className = "tm-fixed tm-bottom-0 tm-right-0";
        container.innerHTML =
            '<div class="tm-fixed tm-bottom-0 tm-left-0 ">\n' +
            '    <ul class="tm-menu tm-menu-xs bg-base-200">\n' +
            '        <li><a class="tm-active" id="tm-toggle-profile"></a></li>\n' +
            '        <li><a class="tm-active" id="tm-toggle-filters"></a></li>\n' +
            '        <li><a class="tm-active" id="tm-toggle-auto-next"></a></li>\n' +
            '        <li id="tm-dates-menu">\n' +
            "            <details>\n" +
            "                <summary>Dernière activité :</summary>\n" +
            "                <ul>\n" +
            '                    <li><a data-value="">sans limite</a></li>\n' +
            '                    <li><a data-value="1">1 mois</a></li>\n' +
            '                    <li><a data-value="2">2 mois</a></li>\n' +
            '                    <li><a data-value="3">3 mois</a></li>\n' +
            '                    <li><a data-value="4">4 mois</a></li>\n' +
            '                    <li><a data-value="5">5 mois</a></li>\n' +
            '                    <li><a data-value="6">6 mois</a></li>\n' +
            '                    <li><a data-value="7">7 mois</a></li>\n' +
            '                    <li><a data-value="8">8 mois</a></li>\n' +
            '                    <li><a data-value="9">9 mois</a></li>\n' +
            '                    <li><a data-value="10">10 mois</a></li>\n' +
            '                    <li><a data-value="11">11 mois</a></li>\n' +
            '                    <li><a data-value="12">12 mois</a></li>\n' +
            "                </ul>\n" +
            "            </details>\n" +
            "        </li>\n" +
            '        <li id="tm-ages-menu">\n' +
            "            <details>\n" +
            "                <summary>Age :</summary>\n" +
            "                <ul>\n" +
            '                    <li><a data-value="">sans limite</a></li>\n' +
            '                    <li><a data-value="22">22 ans</a></li>\n' +
            '                    <li><a data-value="25">25 ans</a></li>\n' +
            '                    <li><a data-value="30">30 ans</a></li>\n' +
            '                    <li><a data-value="35">35 ans</a></li>\n' +
            '                    <li><a data-value="40">40 ans</a></li>\n' +
            '                    <li><a data-value="50">50 ans</a></li>\n' +
            "                </ul>\n" +
            "            </details>\n" +
            "        </li>\n" +
            "    </ul>\n" +
            "</div>\n";

        const toggleProfile = container.querySelector("#tm-toggle-profile");
        if (profile) {
            this.profileButton(toggleProfile, profile);
            toggleProfile.addEventListener(
                "click",
                function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const alt = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
                    TmDebug("toggleProfile click", profile, !!this.getIndicatorValue(profile), "alt", alt);
                    this.setIndicatorValue(profile, !this.getIndicatorValue(profile), !alt);
                    this.profileButton(toggleProfile, profile);
                }.bind(this),
            );
            document.addEventListener(
                "keydown",
                function (e) {
                    if (e.code === "KeyH") {
                        this.setIndicatorValue(profile, true, true);
                        this.profileButton(toggleProfile, profile);
                    }
                    if (e.code === "KeyS") {
                        this.setIndicatorValue(profile, false);
                        this.profileButton(toggleProfile, profile);
                    }
                    if (e.code === "KeyD") {
                        this.setIndicatorValue(profile, true);
                        this.profileButton(toggleProfile, profile);
                    }
                }.bind(this),
            );
        } else {
            toggleProfile.classList.add("tm-hidden");
        }

        const toggleFilters = container.querySelector("#tm-toggle-filters");
        this.filterButton(toggleFilters);
        toggleFilters.addEventListener(
            "click",
            function (e) {
                e.preventDefault();
                this.setFiltersValue(this.getFiltersValue() ? "off" : "on");
                this.filterButton(toggleFilters);
                filterCallback(this.getFiltersValue());
            }.bind(this),
        );

        const toggleAutoNext = container.querySelector("#tm-toggle-auto-next");
        if (autoNext) {
            this.autoNextButton(toggleAutoNext);
            toggleAutoNext.addEventListener(
                "click",
                function (e) {
                    e.preventDefault();
                    this.setAutoNextValue(this.getAutoNextValue() ? "off" : "on");
                    this.autoNextButton(toggleAutoNext);
                }.bind(this),
            );
        } else {
            toggleAutoNext.classList.add("tm-hidden");
        }

        const datesMenu = container.querySelector("#tm-dates-menu");
        if (filterDate && typeof filterCallback === "function") {
            const datesMenuSummary = datesMenu.querySelector("summary");
            const datesMenuChooses = datesMenu.querySelectorAll("a");
            this.filterDateMenu(datesMenuSummary, datesMenuChooses);
            datesMenuChooses.forEach(
                function (choose) {
                    choose.addEventListener(
                        "click",
                        function (e) {
                            e.preventDefault();
                            const dateFilterValue = choose.getAttribute("data-value");
                            this.setDateFilterValue(dateFilterValue);
                            this.filterDateMenu(datesMenuSummary, datesMenuChooses);
                            filterCallback(dateFilterValue);
                        }.bind(this),
                    );
                }.bind(this),
            );
        } else {
            datesMenu.classList.add("tm-hidden");
        }

        const agesMenu = container.querySelector("#tm-ages-menu");
        if (filterAge && typeof filterCallback === "function") {
            const agesMenuSummary = agesMenu.querySelector("summary");
            const agesMenuChooses = agesMenu.querySelectorAll("a");
            this.filterAgeMenu(agesMenuSummary, agesMenuChooses);
            agesMenuChooses.forEach(
                function (choose) {
                    choose.addEventListener(
                        "click",
                        function (e) {
                            e.preventDefault();
                            const ageFilterValue = choose.getAttribute("data-value");
                            this.setAgeFilterValue(ageFilterValue);
                            this.filterAgeMenu(agesMenuSummary, agesMenuChooses);
                            filterCallback(ageFilterValue);
                        }.bind(this),
                    );
                }.bind(this),
            );
        } else {
            agesMenu.classList.add("tm-hidden");
        }

        document.body.appendChild(container);
    }

    indicatorCookie = "tm-indicator-";
    indicatorHiddenTemp = "hidden";
    indicatorHiddenDefinitive = "remove";
    getIndicatorValue(id) {
        const profile = this.getProfile(id);
        if (profile) {
            if (! profile.hide_until) {
                return false;
            }
            if (profile.hide_until > new Date('2049-01-01')) {
                return this.indicatorHiddenDefinitive;
            }
            return this.indicatorHiddenTemp;
        }

        let value;
        const stored = GM_getValue(this.indicatorCookie + id);
        if (stored && typeof stored === "object" && stored.date > new Date().getTime() - 1000 * 60 * 60 * 24 * 3) {
            value = this.indicatorHiddenTemp;
        } else if (stored === this.indicatorHiddenTemp) {
            value = false;
        } else {
            value = stored;
        }
        fetch("https://games.felixgilles.fr/api/" + id + "/set-hide", {
            method: 'POST',
            body: {
                hide: value === this.indicatorHiddenDefinitive,
                hide_until: value === this.indicatorHiddenTemp
            },
            headers: {
                Accept: 'application/json',
                Authorization: "Bearer " + this.token,
            }
        });

        return value;
    }
    setIndicatorValue(id, value, temp) {
        fetch("https://games.felixgilles.fr/api/" + id + "/set-hide", {
            method: 'POST',
            body: {
                hide: value && !temp,
                hide_until: value && temp
            },
            headers: {
                Accept: 'application/json',
                Authorization: "Bearer " + this.token,
            }
        })
            .then(response => response.json())
            .then((response) => {
                this.profiles[id] = response.data;
            });
    }

    indicatorButton(indicator, link, indicatorValue, textAction) {
        if (indicatorValue) {
            indicator.classList.remove("tm-badge-success");
            indicator.classList.add("tm-badge-error");
            link.innerHTML = indicatorValue === this.indicatorHiddenTemp ? "A" : "R";
        } else {
            indicator.classList.remove("tm-badge-error");
            indicator.classList.add("tm-badge-success");
            link.innerHTML = textAction;
        }
    }

    indicator(parent, id, callback) {
        parent.classList.add("tm-indicator");

        const indicator = document.createElement("span");
        indicator.className = "tm-indicator-item tm-indicator-center tm-badge";

        const indicatorValue = this.getIndicatorValue(id);

        const indicatorHide = document.createElement("a");
        indicatorHide.style.marginRight = "0.5rem";
        this.indicatorButton(indicator, indicatorHide, indicatorValue, "C");
        const indicatorDelete = document.createElement("a");
        this.indicatorButton(indicator, indicatorDelete, indicatorValue, "S");

        indicatorHide.addEventListener(
            "click",
            function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const indicatorValue = this.getIndicatorValue(id);
                this.setIndicatorValue(id, !indicatorValue, true);
                this.indicatorButton(indicator, indicatorHide, this.getIndicatorValue(id), "C");
                this.indicatorButton(indicator, indicatorDelete, this.getIndicatorValue(id), "S");
                callback(!indicatorValue);
            }.bind(this),
        );
        indicatorDelete.addEventListener(
            "click",
            function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const indicatorValue = this.getIndicatorValue(id);
                this.setIndicatorValue(id, !indicatorValue);
                this.indicatorButton(indicator, indicatorHide, this.getIndicatorValue(id), "C");
                this.indicatorButton(indicator, indicatorDelete, this.getIndicatorValue(id), "S");
                callback(!indicatorValue);
            }.bind(this),
        );

        indicator.append(indicatorHide, indicatorDelete);
        parent.append(indicator);
    }

    pagination(prevSelector, nextSelector) {
        document.addEventListener("keydown", function (e) {
            if (e.code === "ArrowRight") {
                const next = document.querySelector(nextSelector);
                if (next) {
                    const href = next.getAttribute("href");
                    if (href) {
                        window.location = href;
                    } else {
                        next.click();
                    }
                }
            }
            if (e.code === "ArrowLeft") {
                const prev = document.querySelector(prevSelector);
                if (prev) {
                    const href = prev.getAttribute("href");
                    if (href) {
                        window.location = href;
                    } else {
                        prev.click();
                    }
                }
            }
        });
    }

    setCacheValue(key, value) {
        const cache = {
            date: new Date().getTime(),
            value: value,
        };
        GM_setValue(key, cache);
    }

    getCacheValue(key) {
        const cache = GM_getValue(key);
        if (cache && typeof cache === "object" && cache.date > new Date().getTime() - 1000 * 60 * 60 * 4) {
            return cache.value;
        }
        return null;
    }
}
