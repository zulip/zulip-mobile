export const ReadableColors = {
    names: {
        aqua: "Aqua",
        blue: "Blue",
        brown: "Brown",
        cyan: "Cyan",
        darkblue: "Dark Blue",
        darkcyan: "Dark Cyan",
        darkgreen: "Dark Green",
        darkkhaki: "Dark Khaki",
        darkmagenta: "Dark Magenta",
        darkolivegreen: "Dark Olive Green",
        darkorange: "Dark Orange",
        darkorchid: "Dark Orchid",
        darkred: "Dark Red",
        darksalmon: "Dark Salmon",
        darkviolet: "Dark Violet",
        fuchsia: "Fuchsia",
        gold: "Gold",
        green: "Green",
        indigo: "Indigio",
        lime: "Lime",
        magenta: "Magenta",
        maroon: "Maroon",
        navy: "Navy",
        olive: "Olive",
        orange: "Orange",
        purple: "Purple",
        red: "Red",
        silver: "Silver",
    },

    random: function () {
        let result;
        let count = 0;
        for (var prop in this.names)
            if (Math.random() < 1 / ++count)
                result = prop;
        return { color: result, label: this.names[result] };
    }
    ,

}
