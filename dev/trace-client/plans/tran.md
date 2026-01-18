# instructions
- In product master page we have a grid of all products. One column is "Active" which shows the product active status.
- Create a new feature to update product active status:
    - Clicking the checkbox toggles the active status at server
    - If product is active and its stock is 0 then only allow inactive. Do a confirmation before action.
    - If product is inactive make it active after confirmation
- Server side code is already available:
    - sqlId: getStockOnId tells the current stock position when productId is passed as parameter
    - sqlId: updateProductActiveStatus updates active status with parameters productId and isActive
- Follow the pattern in the codebase