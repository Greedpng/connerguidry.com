import React from 'react';
import './App.css';
import './styles.css';
import {AppBar, Button, TextField, Toolbar, Typography, withStyles} from "@material-ui/core";
import CanvasJSReact from "./canvasjs.react";

const CanvasJSChart = CanvasJSReact.CanvasJSChart

const styles = {
    body: {
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    inputs: {
        marginTop: "2em",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: 'center'
    },
    formControl: {
        minWidth: 120,
    },
    display: {
        marginTop: "16px",
        flexGrow: 100,
    }
};

class Sim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDisabled: true,
            population: "",
            immunity: "",
            startInfected: "",
            daysContagious: "",
            lockdownStart: "",
            lockdownEnd: "",
            maskStart: "",
            maskEnd: "",
            dataPoints: [],
            chartSize: 0
        }
        this.invalidChars = "`-=~!@#$%^&*()_+qwertyuiop[]\asdfghjkl;'zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:ZXCVBNM<>?".split("")
    }

    componentDidMount() {
        document.title = "Disease Sim";
        this.handleResize();
        window.addEventListener("resize", this.handleResize);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((this.state.population && this.state.immunity && this.state.startInfected && this.state.daysContagious && this.state.lockdownStart && this.state.maskStart) && prevState.startDisabled) {
            this.setState({startDisabled: false})
        }
    }

    checkFilled() {
        if ((this.state.population && this.state.immunity && this.state.startInfected && this.state.daysContagious && this.state.lockdownStart && this.state.maskStart) === 1) {
            return (this.state.population && this.state.immunity && this.state.startInfected && this.state.daysContagious && this.state.lockdownStart && this.state.maskStart);
        } else {
            this.setState({startDisabled: true})
            return false
        }
    }

    handleResize = (e) => {
        const chartContainer = document.getElementById('chartContainer').clientHeight;
        this.setState({chartSize: chartContainer});
    }

    onNumberChange = (e) => {
        const value = e.target.value.replace(/[^0-9]+/g, "");
        this.setState({[e.target.name]: value});
        this.checkFilled();
    }

    onPopulationChange = (e) => {
        const value = e.target.value.replace(/[^0-9]+/g, "");
        let intValue = parseInt(value);
        this.setState({population: value});
        if (parseInt(value) < this.state.startInfected) {
            this.setState({startInfected: intValue})
        }
        this.checkFilled();
    }

    onInfectedChange = (e) => {
        const value = e.target.value.replace(/[^0-9]+/g, "");
        let intValue = parseInt(value);
        if (intValue > this.state.population) {
            this.setState({population: intValue, startInfected: intValue})
        } else {
            this.setState({startInfected: value})
        }
    }

    onLockdownChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value >= 0 && value <= 100) {
            this.setState({lockdownStart: value});
            this.checkFilled();
        } else {
            this.setState({lockdownStart: this.state.lockdownStart});
        }
        if (parseInt(value) >= this.state.lockdownEnd) {
            this.setState({lockdownEnd: parseInt(value) + 1})
        }
    }

    onLockdownEndChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        let intValue = parseInt(value);
        if (intValue <= this.state.lockdownStart) {
            let newVal = parseInt(value) - 1
            if (newVal < 0) {
                this.setState({lockdownStart: "", lockdownEnd: ""})
            } else {
                this.setState({lockdownStart: newVal, lockdownEnd: value})
            }
        }else if (value === "") {
            this.setState({lockdownStart: "", lockdownEnd: ""})
        } else if (intValue >= 0 && intValue <= 100) {
            this.setState({lockdownEnd: value});
        } else {
            this.setState({lockdownEnd: this.state.lockdownEnd});
        }
        this.checkFilled();
    }

    onMaskChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value >= 0 && value <= 100) {
            this.setState({maskStart: value});
            this.checkFilled();
        } else {
            this.setState({maskStart: this.state.maskStart});
        }
        if (parseInt(value) >= this.state.maskStart) {
            this.setState({maskEnd: parseInt(value) + 1})
        }
    }

    onMaskEndChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        let intValue = parseInt(value);
        if (intValue <= this.state.maskStart) {
            let newVal = parseInt(value) - 1
            if (newVal < 0) {
                this.setState({maskStart: "", maskEnd: ""})
            } else {
                this.setState({maskStart: newVal, maskEnd: value})
            }
        }else if (value === "") {
            this.setState({maskStart: "", maskEnd: ""})
        } else if (intValue >= 0 && intValue <= 100) {
            this.setState({maskEnd: value});
        } else {
            this.setState({maskEnd: this.state.lockdownEnd});
        }
        this.checkFilled();
    }

    startSim = () => {
        fetch("/run-sim", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "content_type": "application/json"
            },
            body: JSON.stringify(this.state)
        }).then(res => res.json()).then(data => {
            let dataArray = [];
            let i = 0;
            for (i; i < data.contagiousList.length; i++) {
                dataArray.push({"x": i, "y": data.contagiousList[i]})
            }
            this.setState({dataPoints: dataArray});
        });
        this.chart.render()
    }

    onKeyDown = (e) => {
        (this.invalidChars.includes(e.key) || e.key === '"') && e.preventDefault()
    }

    render() {
        const {classes} = this.props;
        const options = {
            height: this.state.chartSize - 1,
            animationEnabled: true,
            theme: "light1",
            title: {
                text: ""
            },
            axisY: {
                title: "Number of Contagious",
                minimum: 0,
                maximum: this.state.population
            },
            axisX: {
                title: "Days"
            },
            data: [{
                type: "line",
                toolTipContent: "Day {x}: Number of Contagious = {y}",
                dataPoints: this.state.dataPoints
            }]
        }
        return (
            <React.Fragment>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">Disease Sim</Typography>
                    </Toolbar>
                </AppBar>
                <div className={classes.body}>
                    <div className={classes.inputs}>
                        <TextField
                            style={{
                                marginRight: "2em"
                            }}
                            inputProps={{
                                pattern: "[0-9]",
                                type: "number",
                                min: 1
                            }}
                            name="population"
                            label="Population Size"
                            type="number"
                            value={this.state.population}
                            onChange={this.onPopulationChange}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em"
                            }}
                            name="immunity"
                            label="Immunity Percentage"
                            type="number"
                            value={this.state.immunity}
                            onChange={this.onNumberChange}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em"
                            }}
                            inputProps={{
                                min: 1
                            }}
                            name="startInfected"
                            label="Starting # of Infected"
                            type="number"
                            value={this.state.startInfected}
                            onChange={this.onInfectedChange}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em"
                            }}
                            name="daysContagious"
                            label="Days Contagious"
                            type="number"
                            value={this.state.daysContagious}
                            onChange={this.onNumberChange}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em",
                                width: 199
                            }}
                            name="lockdownStart"
                            label="Start of Lockdown"
                            placeholder="0-100"
                            type="number"
                            value={this.state.lockdownStart}
                            onChange={this.onLockdownChange}
                            inputProps={{
                                "min": 0,
                                "max": 100
                            }}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em",
                                width: 199
                            }}
                            name="lockdownEnd"
                            label="End of Lockdown"
                            placeholder="0-100"
                            type="number"
                            value={this.state.lockdownEnd}
                            onChange={this.onLockdownEndChange}
                            inputProps={{
                                "min": 0,
                                "max": 100
                            }}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em",
                                width: 199
                            }}
                            name="maskStart"
                            label="Start of Mask Mandate"
                            placeholder="0-100"
                            type="number"
                            value={this.state.maskStart}
                            onChange={this.onMaskChange}
                            inputProps={{
                                "min": 0,
                                "max": 100
                            }}
                            onKeyDown={this.onKeyDown}
                        />
                        <TextField
                            style={{
                                marginRight: "2em",
                                width: 199
                            }}
                            name="maskEnd"
                            label="End of Mask Mandate"
                            placeholder="0-100"
                            type="number"
                            value={this.state.maskEnd}
                            onChange={this.onMaskEndChange}
                            inputProps={{
                                "min": 0,
                                "max": 100
                            }}
                            onKeyDown={this.onKeyDown}
                        />
                    </div>
                    <div className={classes.inputs}>
                        <Button variant="contained" color="primary" onClick={this.startSim}
                                disabled={this.state.startDisabled}>Start</Button>
                    </div>
                    <div id="chartContainer" className={classes.display}>
                        <CanvasJSChart
                            key={this.state.dataPoints.toString()}
                            options={options}
                            onRef={ref => this.chart = ref}
                        />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(Sim);