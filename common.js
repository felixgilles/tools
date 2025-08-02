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
    filtersCookie = "tm-filters";
    autoNextCookie = "tm-auto-next";
    dateFilterCookie = "tm-date-filter";
    routes = [];

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

            return ok;
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

    profileButton(button, id) {
        let value = this.getIndicatorValue(id);
        button.innerHTML = value === "hidden" ? "Profil caché" : "Profil affiché";
        if (value === "hidden") {
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

    filters(params) {
        const filterCallback = params.filterCallback ?? function () {};
        const filterDateCallback = params.filterDateCallback ?? false;
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
                    let indicatorValue = this.getIndicatorValue(profile);
                    indicatorValue = indicatorValue === "hidden" ? "" : "hidden";
                    this.setIndicatorValue(profile, indicatorValue);
                    this.profileButton(toggleProfile, profile);
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
        if (typeof filterDateCallback === "function") {
            const datesMenuSummary = container.querySelector("#tm-dates-menu summary");
            const datesMenuChooses = container.querySelectorAll("#tm-dates-menu a");
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
                            filterDateCallback(dateFilterValue);
                        }.bind(this),
                    );
                }.bind(this),
            );
        } else {
            datesMenu.classList.add("tm-hidden");
        }

        document.body.appendChild(container);
    }

    indicatorCookie = "tm-indicator-";
    getIndicatorValue(id) {
        return GM_getValue(this.indicatorCookie + id);
    }
    setIndicatorValue(id, value) {
        GM_setValue(this.indicatorCookie + id, value);
    }

    indicatorButton(indicator, hidden) {
        if (hidden) {
            indicator.classList.remove("tm-badge-success");
            indicator.classList.add("tm-badge-error");
            indicator.innerHTML = "A";
        } else {
            indicator.classList.remove("tm-badge-error");
            indicator.classList.add("tm-badge-success");
            indicator.innerHTML = "C";
        }
    }

    indicator(parent, id, callback) {
        parent.classList.add("tm-indicator");

        const indicator = document.createElement("a");
        indicator.className = "tm-indicator-item tm-indicator-center tm-badge";

        let indicatorValue = this.getIndicatorValue(id);
        this.indicatorButton(indicator, indicatorValue === "hidden");
        indicator.addEventListener(
            "click",
            function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                indicatorValue = indicatorValue === "hidden" ? "" : "hidden";
                this.setIndicatorValue(id, indicatorValue);
                this.indicatorButton(indicator, indicatorValue === "hidden");
                callback(indicatorValue === "hidden");
            }.bind(this),
        );
        parent.append(indicator);
    }

    pagination(prevSelector, nextSelector) {
        document.addEventListener("keydown", function (e) {
            if (e.code === "ArrowRight") {
                const next = document.querySelector(nextSelector);
                if (next) {
                    window.location = next.getAttribute("href");
                }
            }
            if (e.code === "ArrowLeft") {
                const prev = document.querySelector(prevSelector);
                if (prev) {
                    window.location = prev.getAttribute("href");
                }
            }
        });
    }
}
