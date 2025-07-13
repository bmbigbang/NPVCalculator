import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import type {NPVCalculationResponse} from "../types/api.ts";


type Props = {
    npvValues: NPVCalculationResponse[]
}
export const NPVChart = ({ npvValues }: Props) => {
    if (npvValues.length == 0) {
        return <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-gray-500">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-xl font-medium mb-2">Ready for Analysis</p>
                    <p className="text-gray-600">Enter your parameters and click "Calculate NPV" to see results and visualization</p>
                </div>
            </div>
        </>
    }
    return <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <HighchartsReact
            highcharts={Highcharts}
            options={{
                chart: {
                    type: 'line',
                    height: 400,
                    backgroundColor: 'transparent'
                },
                title: {
                    text: 'NPV vs Discount Rate',
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }
                },
                xAxis: {
                    title: {
                        text: 'Discount Rate (%)'
                    },
                    labels: {
                        formatter: function() {
                            const point = this as any;
                            return (point.value * 100).toFixed(1) + '%';
                        }
                    },
                    gridLineWidth: 1,
                    gridLineDashStyle: 'dot'
                },
                yAxis: {
                    title: {
                        text: 'Net Present Value ($)'
                    },
                    labels: {
                        formatter: function() {
                            const point = this as any;
                            return '$' + point.value.toLocaleString();
                        }
                    },
                    gridLineWidth: 1,
                    gridLineDashStyle: 'dot'
                },
                series: [{
                    name: 'NPV',
                    data: npvValues.map(item => [item.discountRate, item.npv]),
                    color: '#3B82F6',
                    lineWidth: 2,
                    marker: {
                        enabled: true,
                        radius: 4,
                        fillColor: '#3B82F6'
                    }
                }],
                legend: {
                    enabled: false
                },
                tooltip: {
                    formatter: function() {
                        const point = this as any;
                        return `<b>Discount Rate:</b> ${(point.x * 100).toFixed(3)}%<br/>` +
                            `<b>NPV:</b> $${point.y.toLocaleString(undefined, {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3
                            })}`;
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        }
                    }
                },
                credits: {
                    enabled: false
                }
            }}
        />
    </div>
}