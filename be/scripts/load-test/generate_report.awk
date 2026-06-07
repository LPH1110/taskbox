#!/usr/bin/awk -f

BEGIN {
    latency_avg = "N/A"
    latency_max = "N/A"
    req_sec = "N/A"
    errors = 0
}

/Latency/ {
    latency_avg = $2
    latency_max = $4
}
/Requests\/sec:/ {
    req_sec = $2
}
/Non-2xx or 3xx responses:/ {
    errors = $5
}
/Socket errors:/ {
    # Match format: Socket errors: connect 0, read 0, write 0, timeout 5
    # Just flag that socket errors occurred
    errors = errors + $10
}

END {
    printf "  Req/Sec:     %s\n", req_sec
    printf "  Avg Latency: %s\n", latency_avg
    printf "  Max Latency: %s\n", latency_max
    if (errors > 0) {
        printf "  Errors:      %s ❌ (Check Max Latency or Server Logs)\n", errors
    } else {
        printf "  Errors:      0 ✅\n"
    }
}
