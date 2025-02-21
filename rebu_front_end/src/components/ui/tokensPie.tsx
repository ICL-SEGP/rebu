import { ResponsivePie } from '@nivo/pie';

// Summation across months
function sum(array, key) {
  return array.reduce((acc, cur) => acc + (cur[key] || 0), 0);
}

export default function TokensPie({ data }) {
  const totalRebated = sum(data, 'rebate_completed');
  const totalRefunded = sum(data, 'tokens_refunded');

  const chartData = [
    {
      id: 'Completed Rebate',
      label: 'Rebate',
      value: totalRebated,
    },
    {
      id: 'Refunded Tokens',
      label: 'Refunded',
      value: totalRefunded,
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
        innerRadius={0.5}
        colors={{ scheme: 'category10' }}
        padAngle={0.7}
        cornerRadius={3}
        enableArcLinkLabels={true}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#fff"
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            translateY: 50,
            itemWidth: 100,
            itemHeight: 20,
            symbolSize: 18,
            symbolShape: 'circle',
          },
        ]}
      />
    </div>
  );
}