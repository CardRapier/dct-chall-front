import "./App.css";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useState } from "react";

import Chart from "react-apexcharts";
import DatePicker from "react-datepicker";
import { InfinitySpin } from "react-loader-spinner";
import axios from "axios";
import moment from "moment";
import { options } from "./options";

const vehicles = ["990", "991", "1089", "1090", "1200", "1239"];

const fillDatesFromNow = (date: Date) => {
  let dates = [];
  for (let i = 6; 0 <= i; i--) {
    let newDate = moment(date).subtract(i, "days");
    dates.push(newDate.format("YYYY-MM-DD"));
  }
  return dates;
};

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

const formatData = (data: any, keyChoosed: string) => {
  let formattedData = [];

  for (const vehicle of vehicles) {
    let filterData = data.filter((d: any) => d.vehicle === vehicle);
    let choosenData = filterData.map((d: any) => round(d[keyChoosed]));
    formattedData.push({ name: vehicle, data: choosenData });
  }

  return formattedData;
};

function App() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [value, setValue] = useState("lowest_ecu_ev_motor_current");
  const [data, setData] = useState([]);
  const [state, setState] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: fillDatesFromNow(startDate),
      },
    },
    series: [
      {
        name: "series-1",
        data: [30, 40, 45, 50, 49, 60, 70],
      },
      {
        name: "series-2",
        data: [30, 40, 45, 50, 49, 60, 70],
      },
    ],
  });

  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/bringReportDay", { params: { date: startDate } }
        );
        setData(response.data);
        setState({ ...state, series: formatData(response.data, value) });
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadVehicleData();
  }, [startDate]);

  return (
    <div>
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => {
                setStartDate(date);
                setState({
                  ...state,
                  options: {
                    ...state.options,
                    xaxis: { categories: fillDatesFromNow(date) },
                  },
                });
              }}
            />
            <label>
              Elige el dato:
              <select
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setState({
                    ...state,
                    series: formatData(data, e.target.value),
                  });
                }}
              >
                {options.map((option) => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </label>
            <Chart
              options={state.options}
              series={state.series}
              type="bar"
              width="1000"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="loader-container">
          <InfinitySpin color="#000000" />
        </div>
      ) : null}
    </div>
  );
}

export default App;
