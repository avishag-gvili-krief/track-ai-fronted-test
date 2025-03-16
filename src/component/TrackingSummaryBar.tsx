import React from "react";
import "../css/DashboardStyles.css";

interface TrackingSummaryBarProps {
  onTime: number;
  early: number;
  significant: number;
  critical: number;
  completed: number;
}

const TrackingSummaryBar: React.FC<TrackingSummaryBarProps> = (props) => {
  const { onTime, early, significant, critical, completed } = props;

  return (
    <div className="statusSummaryBar">
      <div className="statusItem">
        <div className="statusBarValue">{onTime}</div>
        <div className="statusBarLabel">On Time</div>
      </div>
      <div className="statusItem">
        <div className="statusBarValue">{early}</div>
        <div className="statusBarLabel">Early (1+ days)</div>
      </div>
      <div className="statusItem">
        <div className="statusBarValue">{significant}</div>
        <div className="statusBarLabel">Significant delay (1-4 days)</div>
      </div>
      <div className="statusItem">
        <div className="statusBarValue">{critical}</div>
        <div className="statusBarLabel">Critical delay (5+ days)</div>
      </div>
      <div className="statusItem">
        <div className="statusBarValue">{completed}</div>
        <div className="statusBarLabel">Tracking Completed</div>
      </div>
    </div>
  );
};

export default TrackingSummaryBar;
