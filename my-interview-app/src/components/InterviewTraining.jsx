import { useState } from "react";

const InterviewTraining = () => {
    const [temp, setTemp] = useState("仮");
    return(
        <section className="training">
            <form action="sample.cgi" method="POST">
                <input type="text" name="URL" value={temp}/>
                <select name="favorite_color" id="color-select" required>
                    {/*第一項目をプレースホルダーとして使う小技です*/}
                    <option value="" disabled selected>対策したい内容を選んでください</option>
                    {/*value属性がPOST送信時の値になります*/}
                    <option value="red">赤</option>
                    <option value="blue">青</option>
                    <option value="green">緑</option>
                </select>
                {/*name属性がPOST送信時のキーになります*/}
                <select name="favorite_color" id="color-select" required>
                    {/*第一項目をプレースホルダーとして使う小技です*/}
                    <option value="" disabled selected>規模を選んでください</option>
                    {/*value属性がPOST送信時の値になります*/}
                    <option value="red">赤</option>
                    <option value="blue">青</option>
                    <option value="green">緑</option>
                </select>
            </form>
        </section>
    )
}

export default InterviewTraining;