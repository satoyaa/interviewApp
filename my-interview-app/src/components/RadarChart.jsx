import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';



const RadarChartInterviewScore = ({score}) => (
  <ResponsiveContainer width="100%" height={200}>
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={score}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis />
      <Radar
        name="a"
        dataKey="average"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
    </RadarChart>
  </ResponsiveContainer>
);

export default RadarChartInterviewScore;