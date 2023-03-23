import * as Plot from "@observablehq/plot"
import * as d3 from "d3"
//document.body.append(Plot.plot(options));


export function render(view) {
    // let getCount = () => view.model.get("count");
    // let button = document.createElement("button");
    // button.classList.add("counter-button");
    // button.innerHTML = `The count is ${getCount()}`;
    // button.addEventListener("click", () => {
    //     view.model.set("count", getCount() + 1);
    //     view.model.save_changes();
    // });
    // view.model.on("change:count", () => {
    //     button.innerHTML = `count is ${getCount()}`;
    // });
    //view.el.appendChild(button);

    let spec = () => view.model.get("spec");
    view.el.appendChild(generate_plot(spec()));
    view.model.on('change:spec', () => _onValueChanged(view, view.el));
}

function parse_spec(spec) {
    if (spec === null) {
        return null
    }
    if (Array.isArray(spec)) {
        return spec.map(d => parse_spec(d))
    }
    if (typeof spec === 'string' || spec instanceof String) {
        return spec
    }
    if (Object.entries(spec).length == 0) {
        return spec
    }
    if (spec["ipyobsplot-type"] == "function") {
        let fun;
        switch (spec["module"]) {
            case "Plot":
                fun = Plot[spec["method"]]
                break;
            case "d3":
                fun = d3[spec["method"]]
                break;
            default:
                console.error("Invalid module : ", spec["module"])
        }
        return fun.call(null, ...parse_spec(spec["args"]));
    }
    let ret = {}
    for (const [key, value] of Object.entries(spec)) {
        ret[key] = parse_spec(value)
    }
    return ret
}

function generate_plot(spec) {
    let plot = document.createElement("div");
    plot.classList.add("ipyobsplot-plot");
    let parsed_spec = parse_spec(spec)
    let svg = Plot.plot(parsed_spec)
    plot.appendChild(svg)
    return plot
}

function _onValueChanged(view, el) {
    let plot = el.querySelector(".ipyobsplot-plot")
    el.removeChild(plot)
    let spec = () => view.model.get("spec");
    el.appendChild(generate_plot(spec()));

}

