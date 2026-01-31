# Completed: Multiple Incoming Connections (Node Reuse)

✅ **Implemented** - Messages with multiple incoming connections are now preserved when deleting parent nodes.

## Changes Made
- Added `countIncomingConnections` helper function to `ScenarioContext.tsx`
- Updated `DELETE_MESSAGE` reducer to only delete orphaned child messages
- Updated `DELETE_RESPONSE_OPTION` reducer to preserve messages with other parents
