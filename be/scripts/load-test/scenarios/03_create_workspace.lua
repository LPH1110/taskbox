token = os.getenv("JWT_TOKEN")
if token == nil then
  print("Error: JWT_TOKEN environment variable not set")
  os.exit(1)
end

wrk.method = "POST"
wrk.headers["Authorization"] = "Bearer " .. token
wrk.headers["Content-Type"] = "application/json"

-- Simple counter to ensure unique names (wrk threads share this script)
counter = 0
request = function()
   counter = counter + 1
   wrk.body = '{"name": "Load Test Workspace ' .. counter .. '"}'
   return wrk.format()
end
