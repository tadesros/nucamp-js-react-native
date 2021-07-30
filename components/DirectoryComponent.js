import React, { Component } from "react";
import { FlatList } from "react-native";
import { Tile } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";

//Function: receives state as a prop and returns partner data
//Grab only desired part of state
//Pass to connect later
const mapStateToProps = (state) => {
	return {
		campsites: state.campsites,
	};
};

class Directory extends Component {
	static navigationOptions = {
		title: "Directory",
	};

	render() {
		const { navigate } = this.props.navigation;

		const renderDirectoryItem = ({ item }) => {
			return (
				<Tile
					title={item.name}
					caption={item.description}
					featured
					onPress={() => navigate("CampsiteInfo", { campsiteId: item.id })}
					imageSrc={{ uri: baseUrl + item.image }}
				/>
			);
		};

		return (
			<FlatList
				data={this.props.campsites.campsites}
				renderItem={renderDirectoryItem}
				keyExtractor={(item) => item.id.toString()}
			/>
		);
	}
}

export default connect(mapStateToProps)(Directory);
