import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PieChart as PieIcon, BarChartHorizontal as BarIcon, MapPin } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SectionCard = ({ title, icon: Icon, children, className }) => (
  <motion.div 
    className={`glass-effect rounded-xl overflow-hidden shadow-lg ${className}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <CardHeader className="flex flex-row items-center space-x-3 bg-card/80 border-b border-border/50 p-4">
      {Icon && <Icon className="w-5 h-5 text-primary" />}
      <CardTitle className="text-lg font-semibold text-primary-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 md:p-5">
      {children}
    </CardContent>
  </motion.div>
);

const CustomTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.category_name || data.age_range || data.city;
    const value = data.percentage;
    return (
      <div className="p-2 bg-popover text-popover-foreground rounded-md shadow-lg border border-border text-sm">
        <p className="font-semibold">{`${name}: ${value.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const AudienceInsights = ({ insights }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!insights || !isClient) {
    return <div className="text-center text-muted-foreground py-10">Carregando dados de audiência...</div>;
  }

  const { gender_stats = [], age_range_stats = [], location_stats = [], main_city_override } = insights;
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category_name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';
  
    return (
      <text x={x} y={y} fill="white" textAnchor={textAnchor} dominantBaseline="central" className="text-[10px] md:text-xs font-medium">
        {`${category_name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const mainCityDisplay = main_city_override || (location_stats && location_stats.length > 0 ? location_stats[0].city : 'N/A');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <SectionCard title="Gênero" icon={PieIcon} className="lg:col-span-1">
        {gender_stats && gender_stats.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <RechartsTooltip content={<CustomTooltipContent />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}/>
              <Pie
                data={gender_stats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedPieLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="category_name"
                stroke="hsl(var(--border))"
              >
                {gender_stats.map((entry, index) => (
                  <Cell key={`cell-gender-${index}`} fill={entry.color || `hsl(var(--primary) / ${1 - index * 0.25})`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center py-10 h-[280px] flex items-center justify-center">Dados de gênero indisponíveis.</p>}
      </SectionCard>

      <SectionCard title="Faixa Etária" icon={BarIcon} className="lg:col-span-2">
         {age_range_stats && age_range_stats.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={age_range_stats} margin={{ top: 5, right: 25, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" unit="%" tickFormatter={(tick) => `${tick}`} />
                  <YAxis dataKey="age_range" type="category" stroke="hsl(var(--muted-foreground))" width={55} tick={{fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltipContent />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}/>
                  <Bar dataKey="percentage" barSize={18} radius={[0, 4, 4, 0]}>
                      {age_range_stats.map((entry, index) => (
                          <Cell key={`cell-age-${index}`} fill={entry.color || `hsl(var(--primary) / ${1 - index * 0.12})`} />
                      ))}
                  </Bar>
              </BarChart>
          </ResponsiveContainer>
         ) : <p className="text-muted-foreground text-center py-10 h-[280px] flex items-center justify-center">Dados de faixa etária indisponíveis.</p>}
      </SectionCard>

      <SectionCard title="Top Localidades" icon={MapPin} className="lg:col-span-3">
        {location_stats && location_stats.length > 0 ? (
          <>
            <p className="text-center text-md text-primary-foreground mb-5">
              Principal público em: <span className="font-bold text-accent">{mainCityDisplay}</span>
            </p>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-2 px-2 text-left font-semibold text-muted-foreground">Cidade</th>
                    <th className="py-2 px-2 text-left font-semibold text-muted-foreground hidden sm:table-cell">Estado</th>
                    <th className="py-2 px-2 text-right font-semibold text-muted-foreground">Usuários</th>
                    <th className="py-2 px-2 text-left font-semibold text-muted-foreground w-[120px] md:w-[180px]">Distribuição</th>
                  </tr>
                </thead>
                <tbody>
                  {location_stats.map((loc, index) => (
                    <motion.tr 
                      key={`loc-${index}`}
                      className="border-b border-border/30 hover:bg-primary/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <td className="py-2.5 px-2 text-card-foreground">{loc.city}</td>
                      <td className="py-2.5 px-2 text-card-foreground hidden sm:table-cell">{loc.state}</td>
                      <td className="py-2.5 px-2 text-right text-card-foreground">{loc.users_count_text}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-2 mr-2 overflow-hidden">
                            <motion.div 
                              className="h-2 rounded-full" 
                              style={{ background: `hsl(var(--primary) / ${0.3 + (loc.percentage / 100) * 0.7})` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${loc.percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.15 + index * 0.05, ease: "circOut" }}
                            />
                          </div>
                          <span className="text-xs text-primary font-medium">{loc.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : <p className="text-muted-foreground text-center py-10 h-[280px] flex items-center justify-center">Dados de localização indisponíveis.</p>}
      </SectionCard>
    </div>
  );
};

export default AudienceInsights;