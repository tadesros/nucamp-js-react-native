import React, { Component } from "react";
import {
	Text,
	View,
	ScrollView,
	FlatList,
	Button,
	Modal,
	StyleSheet,
	Alert,
	PanResponder,
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postComment, postFavorite } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

//Function: receives state as a prop and returns partner data
//Grab only desired part of state
//Pass to connect later
const mapStateToProps = (state) => {
	return {
		campsites: state.campsites,
		comments: state.comments,
		favorites: state.favorites,
	};
};

const mapDispatchToProps = {
	postFavorite,
	postComment,
};

//RenderCampsite Component
//Pass in entire props
function RenderCampsite(props) {
	//De-structure campsite from props
	const { campsite } = props;
	//Create a ref store in view
	//Point to an animatable component
	const view = React.createRef();

	//Take distance of object across x-axis return tru < 200
	//Recognize gesture horizontal drag smaller than 200 pixels
	const recognizeDrag = ({ dx }) => (dx < -200 ? true : false);

	//Pan responder
	const panResponder = PanResponder.create({
		//Responds to gestures on the component
		onStartShouldSetPanResponder: () => true,
		onPanResponderGrant: () => {
			//At end of duration return promise finished
			//true if successful false if unsuccessful
			view.current
				.rubberBand(1000)
				.then((endState) =>
					console.log(endState.finished ? "finished" : "canceled")
				);
		},
		onPanResponderEnd: (e, gestureState) => {
			console.log("pan responder end", gestureState);
			if (recognizeDrag(gestureState)) {
				Alert.alert(
					"Add Favorite",
					"Are you sure you wish to add " + campsite.name + " to favorites?",
					[
						{
							text: "Cancel",
							style: "cancel",
							onPress: () => console.log("Cancel Pressed"),
						},
						{
							text: "OK",
							onPress: () =>
								props.favorite
									? console.log("Already set as a favorite")
									: props.markFavorite(),
						},
					],
					{ cancelable: false }
				);
			}
			return true;
		},
	});

	//Check if empty truthy
	if (campsite) {
		return (
			<Animatable.View
				animation='fadeInDown'
				duration={2000}
				delay={1000}
				ref={view}
				{...panResponder.panHandlers}
			>
				<Card
					featuredTitle={campsite.name}
					image={{ uri: baseUrl + campsite.image }}
				>
					<Text style={{ margin: 10 }}>{campsite.description}</Text>

					<View style={styles.cardRow}>
						<Icon
							name={props.favorite ? "heart" : "heart-o"}
							type='font-awesome'
							color='#f50'
							raised
							reverse
							onPress={() =>
								props.favorite
									? console.log("Already set as a favorite")
									: props.markFavorite()
							}
						/>
						<Icon
							name='pencil'
							type='font-awesome'
							color='#5637DD'
							raised
							reverse
							onPress={() => props.onShowModal()}
						/>
					</View>
				</Card>
			</Animatable.View>
		);
	}
	//Falsy not a valid campsite
	return (
		<Animatable.View animation='fadeInDown' duration={2000} delay={1000}>
			<Mission />
			<Card title='Community Partners'>
				<FlatList
					data={this.props.partners.partners}
					renderItem={renderPartner}
					keyExtractor={(item) => item.id.toString()}
				/>
			</Card>
		</Animatable.View>
	);
}

//RenderComments Component
//Functional send comments array de-structured
function RenderComments({ comments }) {
	//Function to renderCommentItem
	const renderCommentItem = ({ item: comment }) => {
		return (
			<View style={{ margin: 10 }}>
				<Text style={{ fontSize: 14 }}>{comment.text}</Text>
				<Rating
					type='star'
					ratingCount={5}
					startingValue={comment.rating}
					imageSize={10}
					readonly
					style={{ alignItems: "flex-start", paddingVertical: "5%" }}
				></Rating>
				<Text
					style={{ fontSize: 12 }}
				>{`-- ${comment.author}, ${comment.date}`}</Text>
			</View>
		);
	};

	return (
		<Card title='Comments'>
			<FlatList
				data={comments}
				renderItem={renderCommentItem}
				keyExtractor={(item) => item.id.toString()}
			/>
		</Card>
	);
}
//Campsite Class Component
class CampsiteInfo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showModal: false,
			rating: 5,
			author: "",
			text: "",
		};
	}

	toggleModal() {
		this.setState({ showModal: !this.state.showModal });
	}

	//Method: handleComment -> Takes one parameter campsiteId
	//console.log the state and call toggleModal Method
	handleComment(campsiteId) {
		//Console.log for values
		//campsiteId,rating,author,text
		console.log(
			"Handle Comment Values",
			campsiteId,
			this.state.rating,
			this.state.author,
			this.state.text
		);

		//Post Comment
		this.props.postComment(
			campsiteId,
			this.state.rating,
			this.state.author,
			this.state.text
		);

		this.toggleModal();
	}
	//Method: resetForm -> uses setState to reset all form values back initial values
	resetForm() {
		this.setState({
			showModal: false,
			rating: 5,
			author: "",
			text: "",
		});
	}

	//Event handler toggle site marked favorite
	markFavorite(campsiteId) {
		this.props.postFavorite(campsiteId);
	}
	//Set title
	static navigationOptions = {
		title: "Campsite Information",
	};

	render() {
		const campsiteId = this.props.navigation.getParam("campsiteId");

		const campsite = this.props.campsites.campsites.filter(
			(campsite) => campsite.id === campsiteId
		)[0];

		const comments = this.props.comments.comments.filter(
			(comment) => comment.campsiteId === campsiteId
		);
		return (
			<ScrollView>
				<RenderCampsite
					campsite={campsite}
					favorite={this.props.favorites.includes(campsiteId)}
					markFavorite={() => this.markFavorite(campsiteId)}
					onShowModal={() => this.toggleModal()}
				/>
				<RenderComments comments={comments} />
				<Modal
					animationType={"slide"}
					transparent={false}
					visible={this.state.showModal}
					onRequestClose={() => this.toggleModal()}
				>
					<View style={styles.modal}>
						<Rating
							showRating
							startingValue={this.state.rating}
							imageSize={40}
							onFinishRating={(rating) => this.setState({ rating: rating })}
							style={{ paddingVertical: 10 }}
						/>

						<Input
							placeholder='Author'
							leftIcon={{ type: "font-awesome", name: "user-o" }}
							leftIconContainerStyle={{ paddingRight: 10 }}
							onChangeText={(author) => this.setState({ author: author })}
							value={this.state.author}
						></Input>

						<Input
							placeholder='Comment'
							leftIcon={{ type: "font-awesome", name: "comment-o" }}
							leftIconContainerStyle={{ paddingRight: 10 }}
							onChangeText={(text) => this.setState({ text: text })}
							value={this.state.comment}
						></Input>

						<View style={{ margin: 10 }}>
							<Button
								title='Submit'
								color='#5637DD'
								onPress={() => {
									this.handleComment(campsiteId);
									this.resetForm();
								}}
							/>
						</View>

						<View style={{ margin: 10 }}>
							<Button
								color='#808080'
								title='Cancel'
								onPress={() => {
									this.toggleModal();
									this.resetForm();
								}}
							/>
						</View>
					</View>

					<View style={{ margin: 10 }}></View>
				</Modal>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	cardRow: {
		justifyContent: "center",
		flexDirection: "row",
		margin: 20,
	},
	formRow: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		flexDirection: "row",
		margin: 20,
	},
	formLabel: {
		fontSize: 18,
		flex: 2,
	},
	formItem: {
		flex: 1,
	},
	modal: {
		justifyContent: "center",
		margin: 20,
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		backgroundColor: "#5637DD",
		textAlign: "center",
		color: "#fff",
		marginBottom: 20,
	},
	modalText: {
		fontSize: 18,
		margin: 10,
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);
