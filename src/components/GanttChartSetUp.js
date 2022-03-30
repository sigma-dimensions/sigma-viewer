import "../utils/jsgantt/jsgantt"

class GanttChartSetUp { 
    constructor(div, tasksJSON) {
        this.g = new JSGantt.GanttChart(div,tasksJSON);
        this.g.setOptions({
            vCaptionType: 'Complete',  // Set to Show Caption : None,Caption,Resource,Duration,Complete,
            vQuarterColWidth: 36,
            vDateTaskDisplayFormat: 'day dd month yyyy', // Shown in tool tip box
            vDayMajorDateDisplayFormat: 'mon yyyy - Week ww',// Set format to dates in the "Major" header of the "Day" view
            vWeekMinorDateDisplayFormat: 'dd mon', // Set format to display dates in the "Minor" header of the "Week" view
            vLang: 'en',
            vShowTaskInfoLink: 1, // Show link in tool tip (0/1)
            vShowEndWeekDate: 0,  // Show/Hide the date for the last day of the week in header for daily
            vUseSingleCell: 10000, // Set the threshold cell per table row (Helps performance for large data.
            vFormatArr: ['Day', 'Week', 'Month', 'Quarter'], // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers,
            vShowRes: false, // Disable the resource column.
            vShowComp: false, // Disable the completion column.
            vUseToolTip: false, // Disable tooltips.
            vTotalHeight: 900,
        });
        JSGantt.parseJSONString(tasksJSON, this.g);
        return this.g.Draw();
    }
}

export {GanttChartSetUp}