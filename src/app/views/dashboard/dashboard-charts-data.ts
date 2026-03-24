import { Injectable } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, ChartType, PluginOptionsByType, ScaleOptions, TooltipLabelStyle } from 'chart.js';
import { DeepPartial } from './utils';
import { getStyle } from '@coreui/utils';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  constructor() {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = '#f7941e'; // Orange
    const brandInfo = '#004a99';    // Blue
    const brandInfoBg = 'rgba(0, 74, 153, .1)';
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['Data1'] = [];
    this.mainChart['Data2'] = [];
    this.mainChart['Data3'] = [];

    // generate random values for mainChart
    for (let i = 0; i <= this.mainChart['elements']; i++) {
      this.mainChart['Data1'].push(this.random(50, 240));
      this.mainChart['Data2'].push(this.random(20, 160));
      this.mainChart['Data3'].push(65);
    }

    let labels: string[] = [];
    if (period === 'Month') {
      labels = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
      ];
    } else if (period === 'Year') {
      labels = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
    } else {
      const week = [
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
        'Dimanche'
      ];
      labels = week.concat(week, week, week);
    }

    const colors = [
      {
        // brandInfo
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        // brandSuccess
        backgroundColor: 'transparent',
        borderColor: brandSuccess || '#4dbd74',
        pointHoverBackgroundColor: '#fff'
      },
      {
        // brandDanger
        backgroundColor: 'transparent',
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets: ChartDataset[] = [
      {
        data: this.mainChart['Data1'],
        label: 'Actuel',
        ...colors[0]
      },
      {
        data: this.mainChart['Data2'],
        label: 'Précédent',
        ...colors[1]
      },
      {
        data: this.mainChart['Data3'],
        label: 'Objectif',
        ...colors[2]
      }
    ];

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    const scales = this.getScales();

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
      },
      animation: {
        duration: 750
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

  getScales() {
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: 250,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5)
        }
      }
    };
    return scales;
  }
}
