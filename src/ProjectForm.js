import React from 'react';
import { Field, reduxForm } from 'redux-form';

let ProjectForm = props => {
    const { handleSubmit } = props;
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="projectId">Project id</label>
                <Field name="projectId" component="input" type="text" />
                <button type="submit">Get data</button>
            </div>
        </form>
    )
}

ProjectForm = reduxForm({
  // a unique name for the form
  form: 'project'
})(ProjectForm);

export default ProjectForm;