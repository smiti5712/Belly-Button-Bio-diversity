// Init function for drop down menu load and intial web page load
function init() {
    var drop_down = d3.select("#selDataset");

    d3.json("data/samples.json").then((data) => {
        // Loop through data.names array and append each of the values into the drop down menu
        data.names.forEach(function(name) {
            drop_down.append("option").text(name);
        });

        // function call for intial web page load
        buildplot(data.names[0]);

    });
}

// init function call for the inital web page
init();

// buildplot function definition
function buildplot(id) {
    d3.json("data/samples.json").then((data) => {

        var metadata = data.metadata.filter(row => row.id === parseInt(id));

        // get object to operate on
        metadata_obj = metadata[0]
            // console.log(metadata_obj)


        // filter samples by subject id chosen from frop down menu
        var samplesfiltered = data.samples.filter(row => row.id === id);

        // get object to operate on
        samplesfiltered_obj = samplesfiltered[0]


        // separate out otu_ids,sample_values and otu_labels from the big object as arrays to operate on
        var otu_ids = Object.values(samplesfiltered_obj.otu_ids)
        var sample_values = Object.values(samplesfiltered_obj.sample_values)
        var otu_labels = Object.values(samplesfiltered_obj.otu_labels)


        // Loop thorugh the arrays of otu_ids,sample_values and otu_labels and pack them individually as an object entry with keys and values
        var samples = otu_ids.map((value, index) => ({
            otu_ids: value,
            sample_values: sample_values[index],
            otu_labels: otu_labels[index]
        }))

        // console.log(samples)

        // sorting samples by sample_values in descending order 
        samples_sorted = samples.sort((a, b) => b.sample_values - a.sample_values)

        // Get top 10 sample data from the sorted array and reverse it for plotly defaults
        sliced_reversed_Data = samples_sorted.slice(0, 10).reverse();


        // ***************************************************
        // Horizontal Bar Chart for Top 10 OTU samples
        // ***************************************************


        // creating trace for Horizontal bar chart, y axis data for OTU_IDs is converted in the desired format by prefixing it with OTU
        var trace1 = {
            x: sliced_reversed_Data.map(object => object.sample_values),
            y: sliced_reversed_Data.map(object => `OTU ${object.otu_ids}`),
            text: sliced_reversed_Data.map(object => object.otu_labels),
            type: "bar",
            orientation: "h"
        };

        var data1 = [trace1];

        // defining layout for bar chart
        var layout1 = {
            title: "Top 10 OTU Samples",
            margin: {
                l: 100,
                r: 100,
                t: 100,
                b: 100
            }
        };

        // build bar Chart
        Plotly.newPlot("bar", data1, layout1);



        // ***************************************************
        // Bubble chart for each sample
        // ***************************************************


        // creating trace for bubble chart
        var trace2 = {
            x: otu_ids,
            y: sample_values,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids
            },
            text: otu_labels

        };

        var data2 = [trace2];

        // set layout for bubble plot
        var layout2 = {
            xaxis: { title: "OTU ID" },
            height: 500,
            width: 1000
        };

        // build bubble chart
        Plotly.newPlot("bubble", data2, layout2);





        // ***************************************************
        // Demographics Information for each Subject
        // ***************************************************


        // select demographic div to append data
        var demographicInfo = d3.select("#sample-metadata");

        // empty information each time before appending
        demographicInfo.html("");

        // loop through metadata object and get the required data to append as a h6 heading text
        Object.entries(metadata_obj).forEach((entry) => {
            demographicInfo.append("h6").text(`${entry[0]}: ${entry[1]}`);
        });





        // ***************************************************
        // gauge Chart for Wash Frequency
        // ***************************************************


        //  get Wash Frequency from metadata object
        var wfreq = metadata_obj.wfreq
            // console.log(`washing Frequency for Subject ID ${id} : ${wfreq}`)

        // create data trace array for Gauge Chart
        var data3 = [{
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            title: { text: `<b>Belly Button Washing Frequency</b> <br> Scrubs per week` },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [null, 9] },
                steps: [
                    { range: [0, 1], color: "#e4f9ee" },
                    { range: [1, 2], color: "#cef9d2" },
                    { range: [2, 3], color: "#b4f9d2" },
                    { range: [3, 4], color: "#b4f9b8" },
                    { range: [4, 5], color: "#9af993" },
                    { range: [5, 6], color: "#85a974" },
                    { range: [6, 7], color: "#709764" },
                    { range: [7, 8], color: "#5a9764" },
                    { range: [8, 9], color: "#369764" }
                ]
            }
        }];

        // set layout for Gauge chart
        var layout3 = {
            width: 700,
            height: 500,
            margin: { t: 20, b: 10, l: 40, r: 150 }
        };

        // plot gauge chart
        Plotly.newPlot("gauge", data3, layout3);


    })
}

// function for drop down option change, that calls buildplot function with the provided drop down subject id
function optionChanged(id) {
    buildplot(id);
}