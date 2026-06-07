token = os.getenv("JWT_TOKEN")
if token == nil then
  print("Error: JWT_TOKEN environment variable not set")
  os.exit(1)
end

wrk.method = "GET"
wrk.headers["Authorization"] = "Bearer " .. token
