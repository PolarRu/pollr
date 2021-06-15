import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { shallow, mount, render } from 'enzyme';
import Login from '../client/login'
//import Landing from '../client/landing'

enzyme.configure({ adapter: new Adapter() });


describe("React unit tests", () => {
  describe("LabeledText", () => {
    let wrapper;
    const props = {
      location: {
        state: {
          pollId: 1,
        }
      },
      match : {
        params: {
          pollId: 1,
        }
      }
    };

    beforeAll(() => {
      wrapper = enzyme.shallow(<Login {...props} />);
    });

    it("Renders a <p> tag with the label in bold", () => {
      console.log(wrapper)
    });
  });
});