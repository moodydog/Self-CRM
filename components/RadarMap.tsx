import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Account, Coordinates } from '../types';
import { calculateDistance } from '../services/geoService';

interface RadarMapProps {
  userLocation: Coordinates;
  customers: Account[];
  onSelectCustomer: (c: Account) => void;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
}

const RadarMap: React.FC<RadarMapProps> = ({ userLocation, customers, onSelectCustomer, selectedIds, onToggleSelection }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDims = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.parentElement!.getBoundingClientRect();
        // Make it a square or slightly rectangular for mobile
        setDimensions({ width, height: width * 1.3 });
      }
    };
    window.addEventListener('resize', updateDims);
    updateDims();
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const width = dimensions.width;
    const height = dimensions.height;
    
    // Config
    const maxRangeKm = 15; // Viewport radius
    const padding = 40;

    // Filter customers in range for display
    const customersInRange = customers.map(c => {
      const d = calculateDistance(userLocation, c.coordinates);
      return { ...c, distance: d };
    }).filter(c => c.distance <= maxRangeKm * 2); 

    // Scales
    const kmPerPixel = (maxRangeKm * 2) / Math.min(width - padding, height - padding);

    const getX = (lng: number) => {
       const diffLng = lng - userLocation.lng;
       const kmDiff = diffLng * 111 * Math.cos(userLocation.lat * Math.PI / 180); 
       return (width / 2) + (kmDiff / kmPerPixel);
    };

    const getY = (lat: number) => {
       const diffLat = lat - userLocation.lat;
       const kmDiff = diffLat * 111;
       return (height / 2) - (kmDiff / kmPerPixel); // Invert Y
    };

    // --- Background / Grid ---
    // Draw Radar Circles
    const rings = [5, 10, 15]; // km
    rings.forEach(r => {
       const rPx = r / kmPerPixel;
       svg.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("r", rPx)
          .attr("fill", "#f8fafc")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4 4");
          
       svg.append("text")
          .attr("x", (width / 2) + 5)
          .attr("y", (height / 2) - rPx + 15)
          .text(`${r}km`)
          .attr("fill", "#94a3b8")
          .attr("font-size", "10px");
    });

    // Crosshairs
    svg.append("line")
       .attr("x1", width/2).attr("y1", 0)
       .attr("x2", width/2).attr("y2", height)
       .attr("stroke", "#f1f5f9");
    svg.append("line")
       .attr("x1", 0).attr("y1", height/2)
       .attr("x2", width).attr("y2", height/2)
       .attr("stroke", "#f1f5f9");

    // --- Draw Route (Connecting Selected Points) ---
    // User -> Customer 1 -> Customer 2 ...
    if (selectedIds.length > 0) {
       const routePathData: [number, number][] = [];
       // Start at user
       routePathData.push([width/2, height/2]);
       
       // Add selected customers in order
       selectedIds.forEach(id => {
          const c = customers.find(cust => cust.id === id);
          if (c) {
             routePathData.push([getX(c.coordinates.lng), getY(c.coordinates.lat)]);
          }
       });

       const lineGenerator = d3.line()
          .x(d => d[0])
          .y(d => d[1])
          //.curve(d3.curveLinear); 
          .curve(d3.curveCatmullRom.alpha(0.5));

       // Halo for line
       svg.append("path")
          .attr("d", lineGenerator(routePathData) || "")
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 5)
          .attr("stroke-opacity", 0.8);

       // Actual line
       svg.append("path")
          .attr("d", lineGenerator(routePathData) || "")
          .attr("fill", "none")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5 5")
          .attr("marker-end", "url(#arrow)");
    }

    // --- Draw User ---
    svg.append("circle")
       .attr("cx", width / 2)
       .attr("cy", height / 2)
       .attr("r", 8)
       .attr("fill", "#3b82f6")
       .attr("stroke", "white")
       .attr("stroke-width", 2);
    
    // Pulse animation
    svg.append("circle")
       .attr("cx", width / 2)
       .attr("cy", height / 2)
       .attr("r", 8)
       .attr("fill", "#3b82f6")
       .attr("opacity", 0.4)
       .transition()
       .duration(2000)
       .ease(d3.easeLinear)
       .attr("r", 25)
       .attr("opacity", 0)
       .on("end", function repeat() {
         d3.select(this)
            .attr("r", 8)
            .attr("opacity", 0.4)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("r", 25)
            .attr("opacity", 0)
            .on("end", repeat);
       });


    // --- Draw Customers ---
    const nodes = svg.selectAll(".customer-node")
       .data(customersInRange)
       .enter()
       .append("g")
       .attr("class", "customer-node")
       .attr("transform", d => `translate(${getX(d.coordinates.lng)}, ${getY(d.coordinates.lat)})`)
       .style("cursor", "pointer")
       // Single click to toggle selection
       .on("click", (e, d) => {
         e.stopPropagation();
         onToggleSelection(d.id);
       });

    // Pin Shadow
    nodes.append("ellipse")
       .attr("cx", 0)
       .attr("cy", 0)
       .attr("rx", 6)
       .attr("ry", 3)
       .attr("fill", "black")
       .attr("opacity", 0.2);

    // Pin Body
    nodes.append("path")
       .attr("d", "M0,-24 C-10,-24 -14,-14 0,0 C14,-14 10,-24 0,-24")
       .attr("fill", d => selectedIds.includes(d.id) ? "#10b981" : "#f43f5e") // Green if selected, Red otherwise
       .attr("stroke", "white")
       .attr("stroke-width", 2);

    // Pin Center Dot (Number if selected)
    nodes.each(function(d) {
        const idx = selectedIds.indexOf(d.id);
        const g = d3.select(this);
        
        if (idx >= 0) {
            // Show route order number
            g.append("text")
                .attr("x", 0)
                .attr("y", -14)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .text(idx + 1);
        } else {
            // Show simple dot
             g.append("circle")
            .attr("cy", -17)
            .attr("r", 3)
            .attr("fill", "rgba(255,255,255,0.8)");
        }
    });

    // Label
    nodes.append("text")
       .attr("text-anchor", "middle")
       .attr("y", -28)
       .text(d => d.name.split(' ')[0]) // First name
       .attr("font-size", "11px")
       .attr("font-weight", "bold")
       .attr("fill", "#1e293b")
       .style("pointer-events", "none")
       .each(function() {
          const bbox = this.getBBox();
          d3.select(this.parentNode as Element).insert("rect", "text")
             .attr("x", bbox.x - 3)
             .attr("y", bbox.y - 1)
             .attr("width", bbox.width + 6)
             .attr("height", bbox.height + 2)
             .attr("fill", "white")
             .attr("opacity", 0.85)
             .attr("rx", 4);
       });

  }, [dimensions, userLocation, customers, onSelectCustomer, selectedIds]);

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
       <svg ref={svgRef} width="100%" height={dimensions.height} className="block" />
       <div className="absolute top-2 left-2 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 shadow-sm border border-slate-100 backdrop-blur-sm">
         Tap pins to add/remove from trip
       </div>
    </div>
  );
};

export default RadarMap;