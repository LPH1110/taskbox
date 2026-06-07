token = os.getenv("JWT_TOKEN")
board_id = os.getenv("TEST_BOARD_ID")

if token == nil or board_id == nil then
  print("Error: JWT_TOKEN or TEST_BOARD_ID environment variables not set")
  os.exit(1)
end

wrk.method = "GET"
wrk.headers["Authorization"] = "Bearer " .. token
