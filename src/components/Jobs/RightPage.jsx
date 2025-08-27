import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import JobBox from "./JobBox";
import useDimension from "../../hooks/useDimensions";

export default function RightPage() {
  const data = new Map([
    [
      "Pending",
      new Map([
        [
          "Today",
          [
            {
              customerName: "Customer 1",
              serviceName: "Service 1",
              address: "address",
              price: "price",
              image: "https://picsum.photos/200/300",
            },
            {
              customerName: "Customer 2",
              serviceName: "Service 2",
              address: "address",
              price: "price",
              image: "https://picsum.photos/201/301",
            },
            {
              customerName: "Customer 3",
              serviceName: "Service 3",
              address: "address",
              price: "price",
              image: "https://picsum.photos/202/302",
            },
          ],
        ],
        [
          "Tomorrow",
          [
            {
              customerName: "Customer 4",
              serviceName: "Service 4",
              address: "address",
              price: "price",
              image: "https://picsum.photos/203/303",
            },
            {
              customerName: "Customer 5",
              serviceName: "Service 5",
              address: "address",
              price: "price",
              image: "https://picsum.photos/204/304",
            },
          ],
        ],
        [
          "Next 7 days",
          [
            {
              customerName: "Customer 6",
              serviceName: "Service 6",
              address: "address",
              price: "price",
              image: "https://picsum.photos/205/305",
            },
            {
              customerName: "Customer 7",
              serviceName: "Service 7",
              address: "address",
              price: "price",
              image: "https://picsum.photos/206/306",
            },
            {
              customerName: "Customer 8",
              serviceName: "Service 8",
              address: "address",
              price: "price",
              image: "https://picsum.photos/207/307",
            },
          ],
        ],
      ]),
    ],
    [
      "Completed",
      new Map([
        [
          "Today",
          [
            {
              customerName: "Customer 9",
              serviceName: "Service 9",
              address: "address",
              price: "price",
              image: "https://picsum.photos/208/308",
            },
          ],
        ],
        [
          "Last 7 days",
          [
            {
              customerName: "Customer 10",
              serviceName: "Service 10",
              address: "address",
              price: "price",
              image: "https://picsum.photos/209/309",
            },
            {
              customerName: "Customer 11",
              serviceName: "Service 11",
              address: "address",
              price: "price",
              image: "https://picsum.photos/210/310",
            },
          ],
        ],
        [
          "Past 30 days",
          [
            {
              customerName: "Customer 12",
              serviceName: "Service 12",
              address: "address",
              price: "price",
              image: "https://picsum.photos/211/311",
            },
            {
              customerName: "Customer 13",
              serviceName: "Service 13",
              address: "address",
              price: "price",
              image: "https://picsum.photos/212/312",
            },
            {
              customerName: "Customer 14",
              serviceName: "Service 14",
              address: "address",
              price: "price",
              image: "https://picsum.photos/213/313",
            },
          ],
        ],
      ]),
    ],
  ]);
  const pendingData = data.get("Completed");
  //   console.log(pendingData);
  let arrayData = [];
  Array.from(pendingData, (data) => {
    arrayData = [...arrayData, data];
  });
  //   console.log(arrayData);
  const { screenHeight, screenWidth } = useDimension();
  return (
    <View style={{ flex: 1, paddingHorizontal: 50 }}>
      <ScrollView
        style={{
          height: screenHeight,
          width: screenWidth * 0.9,
          alignSelf: "center",
        }}
        contentContainerStyle={{
          paddingBottom: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {arrayData.map((data, key) => {
          return (
            <View key={key} style={{ marginBottom: 30, flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text key={key} style={{ color: "#b3b3b3", left: 10 }}>
                  {data[0].toString()}
                </Text>
                ;
                <View
                  style={{
                    borderWidth: 1,
                    height: 1,
                    width: "70%",
                    //   color: "#b3b3b3",
                    borderColor: "#b3b3b3",
                  }}
                ></View>
              </View>

              <View style={{ flexDirection: "column", gap: 10, top: 10 }}>
                {data[1].map((data, key) => {
                  return <JobBox key={key} data={data} isPending={false} />;
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
