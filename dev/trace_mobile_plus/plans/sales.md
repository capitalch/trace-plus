# Instructions to alter appBar in sales_page
- For sales_page I want to apply "Provider + FutureBuilder Hybrid" approach as mentioned in response.md
- create SalesProvider with fields startDate, endDate as in response.md. default dates are today's date
- appBar in sales_page horizontally scrollable:
    - provide action buttons for Today, (-1) day, (-2) days, (-3) days, This month, Last 1 month, Last 2 months, Last 3 months
    - On click of each action button set correct dates in startDate and endDate of salesProvider
- set the SalesProvider in main.dart