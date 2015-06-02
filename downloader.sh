
while true; do
    curl -s http://www.pls-zh.ch/plsFeed/rss -o "parking_data_$(date +%j%H%M).json"
    echo "Downloaded data. Going to sleep."
    sleep 60
done
