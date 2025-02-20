## Logic for Transaction filter
- predefinedDateRanges: new field dateRangeName
- new method: 
  - setDateRange(dateRangeName):
    - logicObject daeRangeName,function returns startDate and endDate
    - sets the filterOption
- Cleanup
  - predefinedDaeRanges: remove days, months
  - remove getDateRange method
