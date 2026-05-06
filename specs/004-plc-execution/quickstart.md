# Quickstart: PLC Execution Engine

## Setup instructions

1. **Start the server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Run the hardware test loop**:
   - Ensure a local Modbus simulation holds port 502 open. Alternatively, observe the safe catch mechanism natively block errors cleanly if testing without a physical PLC.
   - Run the duplicate block sequence across a valid terminal targeting a tracked file configuration.
     ```bash
     for i in {1..5}; do echo "dup $i" >> /tmp/test.csv; sleep 0.05; done
     ```
   - Natively verify that the Modbus ON logic executes **1** initial jump.
   - Wait the configured duration exactly starting from the terminal log. You should see **1** internal OFF dispatch gracefully shutting the queue down.
